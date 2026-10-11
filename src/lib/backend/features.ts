import "server-only";
import { publicConfig, submissionConfig } from "./config";
export function communityFeatures() {
  let reads = false,
    submissions = false;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  try {
    publicConfig();
    reads = true;
  } catch {}
  try {
    const config = submissionConfig();
    const testKey = /^[123]x0{18,}AA$/.test(siteKey);
    submissions = !!siteKey && (config.mode === "test" ? testKey : !testKey);
  } catch {}
  return { reads, submissions, siteKey: submissions ? siteKey : null };
}
