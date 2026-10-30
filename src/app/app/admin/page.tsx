import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { features } from "@/lib/env";

export const metadata = { title: "Admin · Aura Engine" };

export default async function AdminPage() {
  const user = await getUser();
  if (!user?.isAdmin) notFound();
  const since = daysAgo(7);
  const [leads, users, projects, scans7d, gens, failed] = await Promise.all([
    db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    db.user.count(),
    db.project.count(),
    db.project.count({ where: { createdAt: { gte: since } } }),
    db.generation.groupBy({ by: ["kind"], _count: true, _sum: { credits: true } }),
    db.generation.count({ where: { status: { in: ["failed", "nsfw"] } } }),
  ]);

  return (
    <div>
      <p className="eyebrow mb-2">Admin</p>
      <h1 className="font-display text-5xl">Engine room</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Users", users],
          ["Projects", projects],
          ["Scans (7d)", scans7d],
          ["Leads", leads.length],
          ["Failed gens", failed],
        ].map(([k, v]) => (
          <div key={k} className="card p-5"><p className="eyebrow">{k}</p><p className="font-display text-4xl">{v}</p></div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {Object.entries(features).map(([k, v]) => <span key={k} className={`chip ${v ? "!text-ok" : "!text-bad"}`}>{k}: {v ? "on" : "off"}</span>)}
        {gens.map((g) => <span key={g.kind} className="chip">{g.kind}: {g._count} gens · {g._sum.credits ?? 0} cr</span>)}
      </div>

      <h2 className="mb-4 mt-12 font-display text-3xl">Leads (studio / distribution)</h2>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-muted">
            <tr className="border-b border-line">
              {["When", "Type", "Name", "Email", "Company", "Budget", "Message"].map((h) => <th key={h} className="px-4 py-3 font-normal">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-line/60 align-top">
                <td className="px-4 py-3 text-xs text-muted">{l.createdAt.toISOString().slice(0, 10)}</td>
                <td className="px-4 py-3"><span className="chip">{l.type}</span></td>
                <td className="px-4 py-3">{l.name}</td>
                <td className="px-4 py-3"><a href={`mailto:${l.email}`} className="underline">{l.email}</a></td>
                <td className="px-4 py-3 text-muted">{l.company} {l.url && <a href={l.url.startsWith("http") ? l.url : `https://${l.url}`} target="_blank" rel="noreferrer" className="underline">↗</a>}</td>
                <td className="px-4 py-3 text-muted">{l.budget}</td>
                <td className="max-w-sm px-4 py-3 text-xs text-muted">{l.message}{l.projectId && <a href={`/p/${l.projectId}`} className="ml-1 text-aura underline">project</a>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}
