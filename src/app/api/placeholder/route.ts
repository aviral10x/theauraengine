/** Demo-mode stand-in for generated frames / character sheets. */
export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const label = (searchParams.get("label") || "Aura Engine").slice(0, 90);
  const kind = searchParams.get("kind") || "frame";
  const aspect = searchParams.get("aspect") || "9:16";
  const [w, h] = aspect === "16:9" ? [1280, 720] : aspect === "1:1" ? [900, 900] : [720, 1280];
  let hash = 0;
  for (const ch of label) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = hash % 360;
  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const words = label.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > 26) {
      lines.push(line.trim());
      line = word;
    } else line += " " + word;
  }
  if (line.trim()) lines.push(line.trim());
  const text = lines
    .slice(0, 5)
    .map((l, i) => `<text x="50%" y="${h / 2 + (i - lines.length / 2) * 44}" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="#f5efe6">${esc(l)}</text>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><radialGradient id="g" cx="50%" cy="35%" r="80%"><stop offset="0" stop-color="hsl(${hue} 70% 45%)"/><stop offset="1" stop-color="#0b0a0f"/></radialGradient></defs>
<rect width="100%" height="100%" fill="url(#g)"/>
<text x="50%" y="70" text-anchor="middle" font-family="monospace" font-size="20" fill="#f5efe699" letter-spacing="4">DEMO ${esc(kind.toUpperCase())}</text>
${text}
<text x="50%" y="${h - 50}" text-anchor="middle" font-family="monospace" font-size="18" fill="#f5efe666">add Higgsfield keys to generate real frames</text>
</svg>`;
  return new Response(svg, { headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=86400" } });
}
