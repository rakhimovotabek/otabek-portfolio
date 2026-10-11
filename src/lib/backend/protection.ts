import "server-only";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { z } from "zod";
import { ApiError, unavailable } from "./errors";
import type { SubmissionConfig } from "./config";

export function checkOrigin(
  request: Request,
  required: boolean,
  origin = process.env.SITE_ORIGIN,
) {
  const supplied = request.headers.get("origin");
  if (!supplied && !required) return; // Bearer-only owner API also supports CLI clients.
  if (!origin) throw unavailable();
  if (supplied !== origin) throw new ApiError(403, "origin_not_allowed");
}
export function subjectHash(request: Request, config: SubmissionConfig) {
  const raw = config.ipHeader
    ? request.headers.get(config.ipHeader)
    : config.localIp
      ? "127.0.0.1"
      : null;
  if (!raw || !isIP(raw)) throw unavailable();
  // Canonicalize IPv6 spellings and IPv4-mapped IPv6 before hashing.
  let ip = raw;
  if (isIP(raw) === 6) {
    ip = new URL(`http://[${raw}]/`).hostname.slice(1, -1);
    const mapped = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i.exec(ip);
    if (mapped) {
      const first = parseInt(mapped[1], 16),
        second = parseInt(mapped[2], 16);
      ip = `${first >> 8}.${first & 255}.${second >> 8}.${second & 255}`;
    }
  }
  return createHmac("sha256", config.hashSecret)
    .update(`portfolio-submissions:${ip}`)
    .digest("hex");
}
const verificationSchema = z.object({
  success: z.boolean(),
  hostname: z.string().optional(),
  action: z.string().optional(),
});
export async function verifyTurnstile(
  token: string,
  action: "contact" | "comment",
  config: SubmissionConfig,
  send: typeof fetch = fetch,
) {
  let response: Response;
  try {
    response = await send(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: config.turnstileSecret,
          response: token,
        }),
        signal: AbortSignal.timeout(5000),
      },
    );
  } catch {
    throw unavailable();
  }
  if (!response.ok) throw unavailable();
  let result: z.infer<typeof verificationSchema>;
  try {
    result = verificationSchema.parse(await response.json());
  } catch {
    throw unavailable();
  }
  if (
    !result.success ||
    (config.mode !== "test" &&
      (result.hostname !== config.turnstileHostname ||
        result.action !== action))
  )
    throw new ApiError(400, "verification_failed");
}
export async function protectSubmission(
  request: Request,
  token: string,
  action: "contact" | "comment",
  config: SubmissionConfig,
  consume: (hash: string) => Promise<boolean>,
  send: typeof fetch = fetch,
) {
  const hash = subjectHash(request, config);
  if (!(await consume(hash))) throw new ApiError(429, "rate_limit_exceeded");
  await verifyTurnstile(token, action, config, send);
}
