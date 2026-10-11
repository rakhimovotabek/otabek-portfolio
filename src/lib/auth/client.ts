"use client";
import { requestJson, RequestError } from "@/lib/community/client";
import type { AuthState } from "./gateway";
let refreshing: Promise<AuthState> | undefined;
export async function ownerJson<T>(url: string, init: RequestInit = {}) {
  try {
    return await requestJson<T>(url, init);
  } catch (error) {
    if (!(error instanceof RequestError) || error.status !== 401) throw error;
    refreshing ??= requestJson<AuthState>("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    }).finally(() => {
      refreshing = undefined;
    });
    const state = await refreshing;
    if (state.state !== "owner")
      throw new RequestError(401, "authentication_required");
    return requestJson<T>(url, init);
  }
}
