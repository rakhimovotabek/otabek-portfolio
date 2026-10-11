"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { site } from "@/data/site";
import {
  requestJson,
  errorMessage,
  RequestError,
} from "@/lib/community/client";
import type { AuthState } from "@/lib/auth/gateway";
const noSubscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
type Enrollment = { factorId: string; qr: string; secret: string };
export function OwnerLogin({
  configured,
  localLogout = false,
}: {
  configured: boolean;
  localLogout?: boolean;
}) {
  const router = useRouter();
  const hydrated = useSyncExternalStore(noSubscribe, clientReady, serverReady);
  const [stage, setStage] = useState<AuthState | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const lock = useRef(false);
  const accept = (state: AuthState) => {
    if (state.state === "owner") {
      router.replace("/admin");
      router.refresh();
    } else setStage(state);
  };
  useEffect(() => {
    if (!configured) return;
    const abort = new AbortController();
    void requestJson<AuthState>("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      signal: abort.signal,
    })
      .then((state) => {
        if (state.state === "owner") {
          router.replace("/admin");
          router.refresh();
        } else setStage(state);
      })
      .catch(() => {});
    return () => abort.abort();
  }, [configured, router]);
  async function perform(action: string, body: unknown) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await requestJson<AuthState | Enrollment>(
        `/api/auth/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      if ("qr" in result) setEnrollment(result);
      else accept(result);
    } catch (failure) {
      if (failure instanceof RequestError && failure.status === 401) {
        setError(
          action === "login"
            ? "Sign-in was not accepted. Check your owner email and password."
            : "Your sign-in expired. Enter your owner credentials again.",
        );
        if (action !== "login") {
          setStage(null);
          setEnrollment(null);
        }
      } else setError(errorMessage(failure, "owner"));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <main className="owner-shell owner-login">
      <Link href="/" className="owner-wordmark">
        {site.brand}
        <span> / PRIVATE</span>
      </Link>
      <div className="owner-login-frame">
        <span className="eyebrow">OWNER ACCESS</span>
        <h1>{stage ? "One more key." : "Behind the archive."}</h1>
        <p className="owner-intro">
          An allowlisted owner account and an authenticator code are required.
          There is no public registration.
        </p>
        {localLogout && (
          <p role="status" className="form-notice">
            Browser session cleared. Remote sign-out could not be confirmed;
            reconnect to verify it in Supabase.
          </p>
        )}
        {!configured && (
          <p role="status" className="form-notice">
            Owner access is not configured. Follow docs/SUPABASE_SETUP.md to
            connect Supabase and set the website origin.
          </p>
        )}
        <noscript>
          <p className="form-notice">
            Owner sign-in requires JavaScript. Credentials are never submitted
            through a URL.
          </p>
        </noscript>
        {!stage ? (
          <form
            className="submission-form"
            method="post"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              void perform("login", {
                email: data.get("email"),
                password: data.get("password"),
              });
            }}
          >
            <fieldset disabled={!configured || busy || !hydrated}>
              <label htmlFor="owner-email">Owner email</label>
              <input
                id="owner-email"
                name="email"
                type="email"
                autoComplete="username"
                required
                maxLength={254}
              />
              <label htmlFor="owner-password">Password</label>
              <input
                id="owner-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                maxLength={256}
              />
              <button className="form-button" type="submit">
                {busy ? "Checking access…" : "Sign in →"}
              </button>
            </fieldset>
          </form>
        ) : (
          <div>
            {stage.needsEnrollment && !enrollment && (
              <div className="mfa-enrollment">
                <p>
                  Set up TOTP in your authenticator app. Setup is available only
                  after your owner identity has been verified.
                </p>
                <button
                  className="form-button"
                  disabled={busy}
                  onClick={() => void perform("enroll", {})}
                >
                  Set up authenticator →
                </button>
              </div>
            )}
            {enrollment && (
              <div className="mfa-enrollment">
                <p>
                  Scan this code in your authenticator app. Keep the setup key
                  private.
                </p>
                {/* Supabase provides an SVG; data-URI image rendering avoids injecting markup. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="mfa-qr"
                  src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(enrollment.qr)}`}
                  alt="Authenticator enrollment QR code"
                  width={220}
                  height={220}
                />
                <details>
                  <summary>Enter the setup key manually</summary>
                  <code>{enrollment.secret}</code>
                </details>
              </div>
            )}
            {(stage.factorId || enrollment) && (
              <form
                className="submission-form"
                method="post"
                onSubmit={(event) => {
                  event.preventDefault();
                  const data = new FormData(event.currentTarget);
                  void perform("verify", {
                    factorId: enrollment?.factorId ?? stage.factorId,
                    code: data.get("code"),
                  });
                }}
              >
                <fieldset disabled={busy}>
                  <label htmlFor="owner-code">
                    Six-digit authenticator code
                  </label>
                  <input
                    autoFocus
                    id="owner-code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    minLength={6}
                    maxLength={6}
                    required
                  />
                  <button className="form-button" type="submit">
                    {busy ? "Verifying…" : "Unlock archive →"}
                  </button>
                </fieldset>
              </form>
            )}
            <button
              className="inline-button"
              disabled={busy}
              onClick={async () => {
                try {
                  await requestJson("/api/auth/logout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: "{}",
                  });
                  setStage(null);
                  setEnrollment(null);
                  setError("");
                } catch (failure) {
                  setError(errorMessage(failure, "owner"));
                }
              }}
            >
              Cancel and sign out
            </button>
          </div>
        )}
        <p role="status" aria-live="polite" className="form-notice form-error">
          {error}
        </p>
        <Link href="/" className="text-link">
          Return to the portfolio ↗
        </Link>
      </div>
    </main>
  );
}
