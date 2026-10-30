import * as z from "zod/v4";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { getOrCreateAnonId, getUser } from "@/lib/auth";
import { crawlSite, CrawlError } from "@/lib/crawl";
import { scanBrand } from "@/lib/claude";
import { getFormat } from "@/lib/formats";
import { errorResponse } from "@/lib/project";

export const maxDuration = 300;

const Body = z.object({ url: z.string().min(3).max(500) });

const ANON_DAILY = Number(process.env.ANON_SCANS_PER_DAY || 3);
const USER_DAILY = Number(process.env.USER_SCANS_PER_DAY || 25);

export async function POST(req: Request) {
  try {
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "Enter a website URL." }, { status: 400 });

    const user = await getUser();
    const anonId = user ? null : await getOrCreateAnonId();
    const h = await headers();
    const ip = (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "unknown").trim();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const count = user
      ? await db.project.count({ where: { userId: user.id, createdAt: { gte: since } } })
      : await db.project.count({ where: { ip, userId: null, createdAt: { gte: since } } });
    if (count >= (user ? USER_DAILY : ANON_DAILY)) {
      return Response.json(
        { error: user ? "Daily scan limit reached. Try again tomorrow." : "Free scan limit reached. Create a free account to keep scanning." },
        { status: 429 },
      );
    }

    const crawl = await crawlSite(parsed.data.url);
    const scan = await scanBrand(crawl);
    const top = scan.concepts[0]?.formatId ?? scan.formatRanking[0]?.formatId;
    const project = await db.project.create({
      data: {
        userId: user?.id ?? null,
        anonId,
        ip,
        url: crawl.url,
        domain: crawl.domain,
        name: scan.brand.name,
        crawl: JSON.stringify(crawl),
        dna: JSON.stringify(scan),
        formatId: top,
        aspect: getFormat(top).aspect,
      },
    });
    return Response.json({ id: project.id });
  } catch (e) {
    if (e instanceof CrawlError) return Response.json({ error: e.message }, { status: 422 });
    return errorResponse(e);
  }
}
