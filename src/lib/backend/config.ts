import { z } from "zod";
import { unavailable } from "./errors";

const nonempty = z.string().min(1);
function isPublicKey(key: string) {
  if (key.startsWith("sb_publishable_")) return true;
  const parts = key.split(".");
  if (parts.length !== 3) return false;
  try {
    return (
      JSON.parse(Buffer.from(parts[1], "base64url").toString()).role === "anon"
    );
  } catch {
    return false;
  }
}
const publicSchema = z.object({
  url: z.url(),
  key: z.string().trim().min(1).refine(isPublicKey),
});
export const TEST_TURNSTILE_SECRETS = [
  "1x0000000000000000000000000000000AA",
  "2x0000000000000000000000000000000AA",
  "3x0000000000000000000000000000000AA",
] as const;
export function publicConfig(env: NodeJS.ProcessEnv = process.env) {
  const parsed = publicSchema.safeParse({
    url: env.SUPABASE_URL,
    key: env.SUPABASE_PUBLISHABLE_KEY,
  });
  if (!parsed.success) throw unavailable();
  if (
    env.NODE_ENV === "production" &&
    new URL(parsed.data.url).protocol !== "https:"
  )
    throw unavailable();
  return parsed.data;
}
export function submissionConfig(env: NodeJS.ProcessEnv = process.env) {
  const db = publicConfig(env);
  const parsed = z
    .object({
      serviceKey: nonempty,
      origin: z.url(),
      turnstileSecret: nonempty,
      turnstileHostname: nonempty,
      hashSecret: z.string().min(32),
      ipHeader: z
        .enum(["x-nf-client-connection-ip", "cf-connecting-ip"])
        .optional(),
      mode: z.enum(["real", "test"]),
    })
    .safeParse({
      serviceKey: env.SUPABASE_SERVICE_ROLE_KEY,
      origin: env.SITE_ORIGIN,
      turnstileSecret: env.TURNSTILE_SECRET_KEY,
      turnstileHostname: env.TURNSTILE_HOSTNAME,
      hashSecret: env.RATE_LIMIT_HMAC_SECRET,
      ipHeader: env.TRUSTED_IP_HEADER || undefined,
      mode: env.TURNSTILE_MODE || "real",
    });
  if (!parsed.success) throw unavailable();
  const config = parsed.data;
  const origin = new URL(config.origin);
  if (
    origin.origin !== config.origin ||
    origin.hostname !== config.turnstileHostname
  )
    throw unavailable();
  const dummySecret = TEST_TURNSTILE_SECRETS.some(
    (key) => key === config.turnstileSecret,
  );
  if (
    config.mode === "test"
      ? env.NODE_ENV === "production" || !dummySecret
      : dummySecret
  )
    throw unavailable();
  if (
    env.NODE_ENV === "production" &&
    (origin.protocol !== "https:" || !config.ipHeader)
  )
    throw unavailable();
  const localIp =
    env.NODE_ENV !== "production" && env.BACKEND_LOCAL_IP === "true";
  if (!config.ipHeader && !localIp) throw unavailable();
  return { ...db, ...config, localIp };
}
export type SubmissionConfig = ReturnType<typeof submissionConfig>;
