export class RequestError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}
export async function requestJson<T>(
  url: string,
  init: RequestInit = {},
  expectedStatus?: number,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: init.signal ?? AbortSignal.timeout(15000),
    });
  } catch (error) {
    if (init.signal?.aborted) throw error;
    throw new RequestError(0, "network");
  }
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new RequestError(503, "temporarily_unavailable");
  }
  if (!response.ok)
    throw new RequestError(
      response.status,
      typeof data === "object" && data !== null && "error" in data
        ? String(data.error)
        : "temporarily_unavailable",
    );
  if (expectedStatus && response.status !== expectedStatus)
    throw new RequestError(503, "temporarily_unavailable");
  return data as T;
}
export function errorMessage(
  error: unknown,
  context: "submission" | "owner" = "submission",
) {
  const draft = context === "submission";
  if (!(error instanceof RequestError))
    return draft
      ? "Something went wrong. Your draft is still here. Please try again."
      : "The request could not be completed. Please try again.";
  if (error.code === "verification_failed")
    return "Verification expired or was not accepted. Complete a fresh challenge and try again.";
  if (error.status === 429)
    return draft
      ? "Too many attempts. Please wait before trying again; your draft is preserved."
      : "Too many attempts. Please wait before trying again.";
  if (error.status === 400 || error.status === 413)
    return "Please check the field lengths and required information.";
  if (error.status === 401)
    return "Your session expired. Please sign in again.";
  if (error.status === 403)
    return "Access was not authorized. Check your owner setup or the website origin.";
  if (error.code === "network")
    return draft
      ? "We couldn’t confirm delivery. Your draft is preserved. Check your connection before retrying."
      : "The request could not be confirmed. Check your connection before retrying.";
  return draft
    ? "This service is unavailable right now. Your draft is preserved; please try again later."
    : "The archive is unavailable right now. Please try again later.";
}
export function formattedDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}
