import "server-only";

/** Central place for configuration and feature flags. Every integration degrades to a demo mode when unset. */
export const env = {
  appUrl: (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, ""),
  authSecret: process.env.AUTH_SECRET || "",
  adminEmails: (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
  signupCredits: Number(process.env.SIGNUP_CREDITS || 40),

  anthropicKey: process.env.ANTHROPIC_API_KEY || "",
  claudeModel: process.env.CLAUDE_MODEL || "claude-sonnet-5-5",

  hfKeyId: process.env.HF_API_KEY_ID || "",
  hfKeySecret: process.env.HF_API_KEY_SECRET || "",
  hfWebhookSecret: process.env.HF_WEBHOOK_SECRET || "",
  hfImageModel: process.env.HF_IMAGE_MODEL || "xai/grok-imagine-image-2.0",
  hfVideoModel: process.env.HF_VIDEO_MODEL || "kling-video/v3.0/std/image-to-video",

  stripeSecret: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",

  s3Bucket: process.env.S3_BUCKET || "",
  s3Region: process.env.S3_REGION || "auto",
  s3Endpoint: process.env.S3_ENDPOINT || "",
  s3AccessKey: process.env.S3_ACCESS_KEY_ID || "",
  s3SecretKey: process.env.S3_SECRET_ACCESS_KEY || "",
  s3PublicUrl: (process.env.S3_PUBLIC_URL || "").replace(/\/$/, ""),
};

export const features = {
  claude: Boolean(env.anthropicKey),
  higgsfield: Boolean(env.hfKeyId && env.hfKeySecret),
  stripe: Boolean(env.stripeSecret),
  s3: Boolean(env.s3Bucket && env.s3AccessKey && env.s3SecretKey && env.s3PublicUrl),
  webhooks: env.appUrl.startsWith("https://"),
};

export function isProd() {
  return process.env.NODE_ENV === "production";
}
