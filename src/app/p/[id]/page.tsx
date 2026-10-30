import { notFound } from "next/navigation";
import { buildProjectState, HttpError, loadOwnedProject } from "@/lib/project";
import { Studio } from "@/components/studio/Studio";

export const maxDuration = 120;

export const metadata = { title: "Project · Aura Engine", robots: { index: false } };

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loaded = await loadOwnedProject(id).catch((e) => {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  });
  if (!loaded) notFound();
  const { project, user } = loaded;
  const state = await buildProjectState(project, { refresh: true });
  return <Studio initial={state} user={user ? { email: user.email, credits: user.credits } : null} />;
}
