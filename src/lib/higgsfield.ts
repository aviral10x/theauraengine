import "server-only";
import { env, features } from "./env";

const API = (process.env.HF_API_BASE || "https://api.higgsfield.ai").replace(/\/$/, "");

export type HfStatus = "queued" | "in_progress" | "completed" | "failed" | "nsfw" | "canceled";
export type HfSubmitResult = { request_id: string; status: HfStatus; status_url: string; cancel_url?: string };
export type HfStatusResult = {
  request_id: string;
  status: HfStatus;
  error?: string | null;
  images?: { url: string }[];
  video?: { url: string } | null;
};

export class HiggsfieldError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

function authHeader() {
  return `Key ${env.hfKeyId}:${env.hfKeySecret}`;
}

/** Submit an async generation request. `model` is the endpoint id, e.g. "kling-video/v3.0/std/image-to-video". */
export async function hfSubmit(model: string, input: Record<string, unknown>, idempotencyKey: string): Promise<HfSubmitResult> {
  if (!features.higgsfield) throw new HiggsfieldError("Higgsfield is not configured");
  const url = new URL(`${API}/${model}`);
  if (features.webhooks) url.searchParams.set("hf_webhook", `${env.appUrl}/api/webhooks/higgsfield`);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(input),
  });
  const text = await res.text();
  if (!res.ok) throw new HiggsfieldError(`Higgsfield ${res.status}: ${text.slice(0, 300)}`, res.status);
  return JSON.parse(text) as HfSubmitResult;
}

export async function hfStatus(requestId: string, statusUrl?: string | null): Promise<HfStatusResult> {
  const url = statusUrl && statusUrl.startsWith(API) ? statusUrl : `${API}/requests/${requestId}/status`;
  const res = await fetch(url, { headers: { Authorization: authHeader() }, cache: "no-store" });
  const text = await res.text();
  if (!res.ok) throw new HiggsfieldError(`Higgsfield status ${res.status}: ${text.slice(0, 300)}`, res.status);
  return JSON.parse(text) as HfStatusResult;
}

export function outputUrlFrom(r: { images?: { url: string }[]; video?: { url: string } | null }): string | null {
  return r.video?.url ?? r.images?.[0]?.url ?? null;
}

export const VIDEO_MODELS: Record<string, string> = {
  turbo: "kling-video/v3.0-turbo/image-to-video",
  std: env.hfVideoModel,
  pro: "kling-video/v3.0/pro/image-to-video",
};
