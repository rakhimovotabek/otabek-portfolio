"use client";
import { useEffect, useRef, useState } from "react";
type TurnstileAPI = {
  render(node: HTMLElement, options: Record<string, unknown>): string;
  remove(id: string): void;
};
declare global {
  interface Window {
    turnstile?: TurnstileAPI;
  }
}
let loading: Promise<TurnstileAPI> | undefined;
function loadScript() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!loading)
    loading = new Promise<TurnstileAPI>((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      const timer = setTimeout(() => {
        script.remove();
        loading = undefined;
        reject(new Error());
      }, 12000);
      script.onload = () => {
        clearTimeout(timer);
        if (window.turnstile) resolve(window.turnstile);
        else {
          loading = undefined;
          reject(new Error());
        }
      };
      script.onerror = () => {
        clearTimeout(timer);
        script.remove();
        loading = undefined;
        reject(new Error());
      };
      document.head.append(script);
    });
  return loading;
}
export function Turnstile({
  siteKey,
  action,
  revision,
  onToken,
}: {
  siteKey: string;
  action: "contact" | "comment";
  revision: number;
  onToken: (token: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  useEffect(() => {
    callback.current = onToken;
  }, [onToken]);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let disposed = false,
      id: string | undefined,
      api: TurnstileAPI | undefined;
    callback.current("");
    void loadScript()
      .then((value) => {
        if (disposed || !container.current) return;
        api = value;
        id = api.render(container.current, {
          sitekey: siteKey,
          action,
          theme: "auto",
          size: container.current.clientWidth < 300 ? "compact" : "flexible",
          "response-field": false,
          callback: (token: string) => {
            if (!disposed) {
              setError(false);
              callback.current(token);
            }
          },
          "expired-callback": () => {
            if (!disposed) {
              callback.current("");
              setError(true);
            }
          },
          "error-callback": () => {
            if (!disposed) {
              callback.current("");
              setError(true);
            }
          },
          "timeout-callback": () => {
            if (!disposed) {
              callback.current("");
              setError(true);
            }
          },
        });
      })
      .catch(() => {
        if (!disposed) setError(true);
      });
    return () => {
      disposed = true;
      if (api && id !== undefined) api.remove(id);
    };
  }, [siteKey, action, revision, retry]);
  return (
    <div className="verification">
      <div ref={container} aria-label="Spam verification" />
      {error && (
        <p role="status">
          Verification couldn’t finish.{" "}
          <button
            type="button"
            className="inline-button"
            onClick={() => {
              setError(false);
              setRetry((value) => value + 1);
            }}
          >
            Retry verification
          </button>
        </p>
      )}
    </div>
  );
}
