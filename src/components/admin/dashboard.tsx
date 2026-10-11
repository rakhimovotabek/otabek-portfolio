"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { site } from "@/data/site";
import { projects } from "@/data/portfolio";
import { ownerJson } from "@/lib/auth/client";
import {
  requestJson,
  RequestError,
  errorMessage,
  formattedDate,
} from "@/lib/community/client";
import type { CommentRow, MessageRow } from "@/lib/backend/database.types";
import type { OwnerOverview } from "@/lib/backend/repository";
type Tab = "overview" | "inbox" | "comments";
type Page = { items: (MessageRow | CommentRow)[]; nextCursor: string | null };
function targetLabel(row: Pick<CommentRow, "target_type" | "target_id">) {
  return row.target_type === "guestbook"
    ? "Website guestbook"
    : (projects.find((p) => p.id === row.target_id)?.name ?? "Project");
}
export function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview"),
    [filter, setFilter] = useState("unread");
  const [overview, setOverview] = useState<OwnerOverview | null>(null),
    [rows, setRows] = useState<Page["items"]>([]),
    [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
  const [confirmation, setConfirmation] = useState<{
    id: string;
    status: string;
  } | null>(null);
  const lock = useRef(false);
  const generation = useRef(0);
  const fail = useCallback(
    (failure: unknown) => {
      if (
        failure instanceof RequestError &&
        (failure.status === 401 || failure.status === 403)
      ) {
        setRows([]);
        setOverview(null);
        router.replace("/admin/login");
        router.refresh();
      } else setError(errorMessage(failure, "owner"));
    },
    [router],
  );
  useEffect(() => {
    // Re-check restored pages rather than retaining a stale private view.
    const resume = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setRows([]);
        setOverview(null);
        setRevision((v) => v + 1);
      }
    };
    window.addEventListener("pageshow", resume);
    return () => window.removeEventListener("pageshow", resume);
  }, []);
  const load = useCallback(
    async (next: string | null, signal?: AbortSignal) => {
      if (lock.current) return;
      lock.current = true;
      const current = ++generation.current;
      setLoading(true);
      setError("");
      try {
        if (tab === "overview") {
          const result = await ownerJson<OwnerOverview>("/api/owner/overview", {
            signal,
          });
          if (!signal?.aborted && current === generation.current)
            setOverview(result);
        } else {
          const query = new URLSearchParams({ limit: "10" });
          if (filter !== "all") query.set("status", filter);
          if (next) query.set("cursor", next);
          const page = await ownerJson<Page>(
            `/api/owner/${tab === "inbox" ? "inbox" : "comments"}?${query}`,
            { signal },
          );
          if (signal?.aborted || current !== generation.current) return;
          setRows((old) =>
            next
              ? [
                  ...old,
                  ...page.items.filter(
                    (row) => !old.some((item) => item.id === row.id),
                  ),
                ]
              : page.items,
          );
          setCursor(page.nextCursor);
        }
      } catch (failure) {
        if (!signal?.aborted) fail(failure);
      } finally {
        if (current === generation.current) {
          lock.current = false;
          if (!signal?.aborted) setLoading(false);
        }
      }
    },
    [tab, filter, fail],
  );
  useEffect(() => {
    const activeGeneration = generation;
    const abort = new AbortController();
    queueMicrotask(() => {
      if (!abort.signal.aborted) void load(null, abort.signal);
    });
    return () => {
      abort.abort();
      activeGeneration.current++;
      lock.current = false;
    };
  }, [load, revision]);
  function selectTab(value: Tab) {
    setTab(value);
    setFilter(value === "comments" ? "pending" : "unread");
    setRows([]);
    setCursor(null);
    setNotice("");
    setConfirmation(null);
  }
  async function update(id: string, status: string) {
    if (lock.current) return;
    lock.current = true;
    setLoading(true);
    setError("");
    try {
      await ownerJson(
        `/api/owner/${tab === "inbox" ? "inbox" : "comments"}/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      setNotice(
        tab === "inbox" ? `Message marked ${status}.` : `Comment ${status}.`,
      );
      setConfirmation(null);
      setRows([]);
      setCursor(null);
      setRevision((v) => v + 1);
    } catch (failure) {
      fail(failure);
    } finally {
      lock.current = false;
      setLoading(false);
    }
  }
  return (
    <main className="owner-shell">
      <header className="owner-header">
        <Link className="owner-wordmark" href="/">
          {site.brand}
          <span> / PRIVATE ARCHIVE</span>
        </Link>
        <button
          className="inline-button"
          onClick={async () => {
            if (lock.current) return;
            lock.current = true;
            setLoading(true);
            try {
              const result = await requestJson<{ revoked: boolean }>(
                "/api/auth/logout",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: "{}",
                },
              );
              setRows([]);
              setOverview(null);
              if (!result.revoked)
                setNotice(
                  "Browser session cleared. Remote revocation could not be confirmed.",
                );
              router.replace(
                result.revoked ? "/admin/login" : "/admin/login?logout=local",
              );
              router.refresh();
            } catch (failure) {
              fail(failure);
            } finally {
              lock.current = false;
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          Sign out ↗
        </button>
      </header>
      <div className="owner-title">
        <span className="eyebrow">CORRESPONDENCE & MODERATION</span>
        <h1>The private archive.</h1>
        <p>
          Private notes stay here. Public words appear only after your approval.
        </p>
      </div>
      <nav className="owner-tabs" aria-label="Administration">
        <button
          aria-current={tab === "overview" ? "page" : undefined}
          onClick={() => selectTab("overview")}
        >
          Overview
        </button>
        <button
          aria-current={tab === "inbox" ? "page" : undefined}
          onClick={() => selectTab("inbox")}
        >
          Inbox
        </button>
        <button
          aria-current={tab === "comments" ? "page" : undefined}
          onClick={() => selectTab("comments")}
        >
          Comments
        </button>
      </nav>
      <p role="status" aria-live="polite" className="form-notice">
        {loading ? "Reading the archive…" : notice}
      </p>
      {error && (
        <p role="alert" className="form-error">
          {error}{" "}
          <button
            className="inline-button"
            onClick={() => setRevision((v) => v + 1)}
          >
            Retry
          </button>
        </p>
      )}
      {tab === "overview" && overview && (
        <section aria-label="Overview">
          <div className="owner-counts">
            {(
              [
                ["Unread messages", overview.unread],
                ["Pending comments", overview.pending],
                ["Approved comments", overview.approved],
                ["Rejected comments", overview.rejected],
              ] as const
            ).map(([label, count]) => (
              <div key={label}>
                <span className="eyebrow">{label}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
          <h2>Recent moderation</h2>
          <p className="owner-muted">
            Latest changes to currently approved or rejected comments.
          </p>
          {overview.recent.length === 0 && (
            <p className="owner-empty">No moderation activity yet.</p>
          )}
          {overview.recent.map((row) => (
            <div className="owner-activity" key={row.id}>
              <span>
                {row.author_name} / {targetLabel(row)}
              </span>
              <span>
                {row.status} · {formattedDate(row.updated_at)}
              </span>
            </div>
          ))}
        </section>
      )}
      {tab !== "overview" && (
        <section
          aria-label={tab === "inbox" ? "Private inbox" : "Comment moderation"}
        >
          <div className="owner-filter">
            <label htmlFor="owner-status">
              {tab === "inbox" ? "Message status" : "Moderation status"}
            </label>
            <select
              id="owner-status"
              value={filter}
              disabled={loading}
              onChange={(e) => {
                setFilter(e.target.value);
                setRows([]);
                setCursor(null);
                setConfirmation(null);
              }}
            >
              {(tab === "inbox"
                ? ["unread", "read", "archived", "all"]
                : ["pending", "approved", "rejected"]
              ).map((status) => (
                <option value={status} key={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          {!loading && !error && rows.length === 0 && (
            <p className="owner-empty">Nothing in this part of the archive.</p>
          )}
          {rows.map((row) => {
            const message = "message" in row;
            return (
              <article className="owner-entry" key={row.id}>
                <header>
                  <div>
                    <h2>{message ? row.name : row.author_name}</h2>
                    <p>
                      {message
                        ? (row.reply_contact ?? "No reply contact provided")
                        : targetLabel(row)}
                    </p>
                  </div>
                  <span>
                    {row.status} /{" "}
                    <time dateTime={row.created_at}>
                      {formattedDate(row.created_at)}
                    </time>
                  </span>
                </header>
                <p className="owner-entry-content">
                  {message ? row.message : row.content}
                </p>
                <div className="owner-actions">
                  {(message
                    ? ["read", "unread", "archived"]
                    : ["approved", "rejected"]
                  )
                    .filter((status) => status !== row.status)
                    .map((status) => (
                      <button
                        type="button"
                        className="inline-button"
                        disabled={loading}
                        key={status}
                        onClick={() => {
                          if (message && status !== "archived")
                            void update(row.id, status);
                          else setConfirmation({ id: row.id, status });
                        }}
                      >
                        {message
                          ? `Mark ${status}`
                          : status === "approved"
                            ? "Approve"
                            : "Reject"}
                      </button>
                    ))}
                </div>
                {confirmation?.id === row.id && (
                  <div
                    className="owner-confirm"
                    role="group"
                    aria-label="Confirm action"
                  >
                    <p>
                      {confirmation.status === "approved"
                        ? "Publish this comment to the public website?"
                        : confirmation.status === "rejected"
                          ? "Keep this comment private as rejected?"
                          : "Archive this message?"}
                    </p>
                    <button
                      className="form-button"
                      disabled={loading}
                      onClick={() => void update(row.id, confirmation.status)}
                    >
                      Confirm {confirmation.status}
                    </button>
                    <button
                      className="inline-button"
                      disabled={loading}
                      onClick={() => setConfirmation(null)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </article>
            );
          })}
          {cursor && (
            <button
              disabled={loading}
              className="form-button"
              onClick={() => void load(cursor)}
            >
              Load more ↓
            </button>
          )}
        </section>
      )}
    </main>
  );
}
