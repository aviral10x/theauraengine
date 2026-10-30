import type { ProjectState } from "@/lib/project";

export type ApiError = { message: string; code?: "auth" | "credits" | "other" };

export async function api(path: string, init?: { method?: string; body?: unknown }): Promise<{ data?: ProjectState; error?: ApiError }> {
  try {
    const res = await fetch(path, {
      method: init?.method ?? "POST",
      headers: { "content-type": "application/json" },
      body: init?.body !== undefined ? JSON.stringify(init.body) : init?.method === "GET" ? undefined : "{}",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        error: {
          message: json.error || `Request failed (${res.status})`,
          code: res.status === 401 ? "auth" : res.status === 402 ? "credits" : "other",
        },
      };
    }
    return { data: json as ProjectState };
  } catch {
    return { error: { message: "Network error. Please retry.", code: "other" } };
  }
}
