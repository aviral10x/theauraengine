import "server-only";
import * as cheerio from "cheerio";
import { lookup } from "dns/promises";
import net from "net";

export type CrawledPage = { url: string; title: string; text: string };
export type CrawledImage = { url: string; alt: string; source: string };
export type CrawlResult = {
  url: string;
  domain: string;
  title: string;
  description: string;
  siteName: string;
  ogImage: string | null;
  logo: string | null;
  themeColors: string[];
  socials: string[];
  products: { name: string; description?: string; price?: string; image?: string }[];
  images: CrawledImage[];
  pages: CrawledPage[];
};

const MAX_PAGES = 5;
const MAX_BYTES = 1_500_000;
const TIMEOUT_MS = 9000;
const UA =
  "Mozilla/5.0 (compatible; AuraEngineBot/1.0; +https://theauraengine.com/bot) AppleWebKit/537.36 (KHTML, like Gecko)";

export class CrawlError extends Error {}

/** Normalise user input into an http(s) URL. */
export function normalizeUrl(input: string): URL {
  let raw = input.trim();
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new CrawlError("That doesn't look like a valid website address.");
  }
  if (!["http:", "https:"].includes(url.protocol)) throw new CrawlError("Only http(s) URLs are supported.");
  if (url.username || url.password) throw new CrawlError("URLs with credentials are not allowed.");
  if (!url.hostname.includes(".")) throw new CrawlError("Please enter a public website address.");
  url.hash = "";
  return url;
}

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }
  const v6 = ip.toLowerCase();
  if (v6.startsWith("::ffff:")) return isPrivateIp(v6.slice(7));
  return v6 === "::1" || v6 === "::" || v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe80");
}

/** SSRF guard: refuse hosts that resolve to private / loopback / link-local ranges. */
async function assertPublicHost(hostname: string) {
  const host = hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new CrawlError("Private hosts are not allowed.");
  }
  const addrs = net.isIP(host) ? [{ address: host }] : await lookup(host, { all: true }).catch(() => []);
  if (addrs.length === 0) throw new CrawlError(`Couldn't resolve ${hostname}.`);
  if (addrs.some((a) => isPrivateIp(a.address))) throw new CrawlError("Private hosts are not allowed.");
}

/** Fetch with manual redirect handling so every hop passes the SSRF guard. */
async function safeFetch(url: URL, redirects = 4): Promise<{ finalUrl: URL; html: string } | null> {
  await assertPublicHost(url.hostname);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: "manual",
      signal: ctrl.signal,
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml" },
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc || redirects <= 0) return null;
      const next = new URL(loc, url);
      if (!["http:", "https:"].includes(next.protocol)) return null;
      return safeFetch(next, redirects - 1);
    }
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "";
    if (!type.includes("html")) return null;
    const reader = res.body?.getReader();
    if (!reader) return null;
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) {
        await reader.cancel();
        break;
      }
      chunks.push(value);
    }
    return { finalUrl: url, html: Buffer.concat(chunks).toString("utf8") };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function abs(src: string | undefined, base: URL): string | null {
  if (!src) return null;
  try {
    const u = new URL(src.trim(), base);
    return ["http:", "https:"].includes(u.protocol) ? u.toString() : null;
  } catch {
    return null;
  }
}

function cleanText($: cheerio.CheerioAPI): string {
  $("script,style,noscript,svg,iframe,template").remove();
  const parts: string[] = [];
  $("h1,h2,h3,h4,p,li,blockquote,figcaption,td,button,a").each((_, el) => {
    const t = $(el).text().replace(/\s+/g, " ").trim();
    if (t.length > 2 && t.length < 600) parts.push(t);
  });
  const dedup = Array.from(new Set(parts));
  return dedup.join("\n").slice(0, 9000);
}

const SOCIAL_HOSTS = ["instagram.com", "tiktok.com", "youtube.com", "x.com", "twitter.com", "linkedin.com", "facebook.com", "threads.net"];
const PRIORITY = /(about|story|product|shop|collection|pricing|features|how|mission|team|services|listing|property|tokenomics|docs)/i;

function extractProducts($: cheerio.CheerioAPI, base: URL): CrawlResult["products"] {
  const products: CrawlResult["products"] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).text());
      const items = Array.isArray(data) ? data : data["@graph"] ?? [data];
      for (const item of items) {
        const t = item?.["@type"];
        if (t === "Product" || (Array.isArray(t) && t.includes("Product"))) {
          const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
          const img = Array.isArray(item.image) ? item.image[0] : item.image;
          products.push({
            name: String(item.name ?? "").slice(0, 140),
            description: item.description ? String(item.description).slice(0, 400) : undefined,
            price: offer?.price ? `${offer.price} ${offer.priceCurrency ?? ""}`.trim() : undefined,
            image: abs(typeof img === "string" ? img : img?.url, base) ?? undefined,
          });
        }
      }
    } catch {
      /* ignore malformed JSON-LD */
    }
  });
  return products.filter((p) => p.name).slice(0, 12);
}

/** Crawl the homepage plus a handful of high-signal internal pages. */
export async function crawlSite(input: string): Promise<CrawlResult> {
  const start = normalizeUrl(input);
  const home = await safeFetch(start);
  if (!home) throw new CrawlError(`We couldn't load ${start.hostname}. Check the URL or try again.`);

  const base = home.finalUrl;
  const $ = cheerio.load(home.html);
  const meta = (sel: string) => $(sel).attr("content")?.trim() || "";

  const title = $("title").first().text().trim() || meta('meta[property="og:title"]');
  const description = meta('meta[name="description"]') || meta('meta[property="og:description"]');
  const siteName = meta('meta[property="og:site_name"]') || base.hostname.replace(/^www\./, "");
  const ogImage = abs(meta('meta[property="og:image"]') || meta('meta[name="twitter:image"]'), base);
  const logo =
    abs($('link[rel="apple-touch-icon"]').attr("href"), base) ||
    abs($('img[alt*="logo" i], img[src*="logo" i]').first().attr("src"), base) ||
    abs($('link[rel="icon"]').attr("href"), base);

  const colors = new Set<string>();
  const theme = meta('meta[name="theme-color"]');
  if (theme) colors.add(theme.toLowerCase());
  const styleText = $("style").text() + " " + $("[style]").map((_, el) => $(el).attr("style")).get().join(" ");
  for (const m of styleText.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
    colors.add(m[0].toLowerCase());
    if (colors.size >= 8) break;
  }

  const socials = new Set<string>();
  const internal: URL[] = [];
  $("a[href]").each((_, el) => {
    const href = abs($(el).attr("href"), base);
    if (!href) return;
    const u = new URL(href);
    if (SOCIAL_HOSTS.some((h) => u.hostname.endsWith(h))) socials.add(u.toString());
    else if (u.hostname === base.hostname && u.pathname !== base.pathname && !/\.(pdf|jpg|png|zip)$/i.test(u.pathname)) {
      u.search = "";
      u.hash = "";
      if (!internal.some((x) => x.toString() === u.toString())) internal.push(u);
    }
  });

  const images: CrawledImage[] = [];
  const pushImg = (src: string | null, alt: string, source: string) => {
    if (!src || images.some((i) => i.url === src)) return;
    if (/\.(svg|gif)(\?|$)/i.test(src) || /sprite|pixel|tracking|1x1/i.test(src)) return;
    images.push({ url: src, alt: alt.slice(0, 160), source });
  };
  if (ogImage) pushImg(ogImage, "og:image", base.toString());

  const products = extractProducts($, base);
  for (const p of products) pushImg(p.image ?? null, p.name, base.toString());

  const collectImages = (doc: cheerio.CheerioAPI, pageUrl: URL) => {
    doc("img").each((_, el) => {
      const src = doc(el).attr("src") || doc(el).attr("data-src") || doc(el).attr("srcset")?.split(" ")[0];
      pushImg(abs(src, pageUrl), doc(el).attr("alt") || "", pageUrl.toString());
    });
  };
  collectImages($, base);

  const pages: CrawledPage[] = [{ url: base.toString(), title, text: cleanText($) }];
  const queue = internal.sort((a, b) => Number(PRIORITY.test(b.pathname)) - Number(PRIORITY.test(a.pathname))).slice(0, MAX_PAGES - 1);
  const results = await Promise.all(queue.map((u) => safeFetch(u, 2)));
  results.forEach((r, i) => {
    if (!r) return;
    const doc = cheerio.load(r.html);
    collectImages(doc, queue[i]);
    products.push(...extractProducts(doc, queue[i]).filter((p) => !products.some((x) => x.name === p.name)));
    pages.push({ url: queue[i].toString(), title: doc("title").first().text().trim(), text: cleanText(doc).slice(0, 4000) });
  });

  return {
    url: base.toString(),
    domain: base.hostname.replace(/^www\./, ""),
    title,
    description,
    siteName,
    ogImage,
    logo,
    themeColors: Array.from(colors).slice(0, 8),
    socials: Array.from(socials).slice(0, 10),
    products: products.slice(0, 12),
    images: images.slice(0, 24),
    pages,
  };
}
