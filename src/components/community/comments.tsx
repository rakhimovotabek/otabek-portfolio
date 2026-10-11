"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { targetSchema } from "@/lib/backend/validation";
import type { CommentTarget, PublicComment } from "@/types/community";
import {
  requestJson,
  errorMessage,
  formattedDate,
} from "@/lib/community/client";
import { useCommunity } from "./community-provider";
import { useDiscussionLayout } from "./use-discussion-layout";
import { SubmissionForm } from "./submission-form";
const pageSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            id: z.uuid(),
            displayName: z.string().min(2).max(80),
            message: z.string().min(3).max(2000),
            target: targetSchema,
            createdAt: z.iso.datetime({ offset: true }),
          })
          .strict(),
      )
      .max(5),
    nextCursor: z.string().max(512).nullable(),
  })
  .strict();
type CommentPage = { items: PublicComment[]; nextCursor: string | null };
export function Comments({
  id,
  target,
}: {
  id: string;
  target: CommentTarget;
}) {
  const { reads, checking } = useCommunity();
  const region = useRef<HTMLDivElement>(null);
  useDiscussionLayout(region);
  const [entries, setEntries] = useState<PublicComment[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const generation = useRef(0);
  const kind = target.kind,
    projectId = target.kind === "project" ? target.projectId : undefined;
  const load = useCallback(
    async (next: string | null, signal?: AbortSignal) => {
      if (lock.current || !reads) return;
      lock.current = true;
      const current = ++generation.current;
      setLoading(true);
      setError("");
      try {
        const query = new URLSearchParams({ target_type: kind, limit: "5" });
        if (projectId) query.set("target_id", projectId);
        if (next) query.set("cursor", next);
        const result = await requestJson<CommentPage>(
          `/api/comments?${query}`,
          { signal },
        );
        if (signal?.aborted || current !== generation.current) return;
        if (!pageSchema.safeParse(result).success) throw new Error();
        setEntries((previous) =>
          next
            ? [
                ...previous,
                ...result.items.filter(
                  (row) => !previous.some((item) => item.id === row.id),
                ),
              ]
            : result.items,
        );
        setCursor(result.nextCursor);
        setLoaded(true);
      } catch (failure) {
        if (!signal?.aborted) setError(errorMessage(failure, "owner"));
      } finally {
        if (current === generation.current) {
          lock.current = false;
          if (!signal?.aborted) setLoading(false);
        }
      }
    },
    [reads, kind, projectId],
  );
  useEffect(() => {
    const activeGeneration = generation;
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) void load(null, controller.signal);
    });
    return () => {
      controller.abort();
      activeGeneration.current++;
      lock.current = false;
    };
  }, [load]);
  return (
    <div className="discussion" ref={region}>
      <div
        className="comment-list"
        aria-label="Approved comments"
        aria-busy={loading}
      >
        {!reads && (
          <p className="discussion-note">
            {checking
              ? "Checking the comment archive…"
              : "The comment archive is not connected yet."}
          </p>
        )}
        {reads && loaded && entries.length === 0 && (
          <p className="discussion-note">
            The first page is still unwritten. Leave a thought for the archive.
          </p>
        )}
        {entries.map((entry) => (
          <article className="visitor-entry" key={entry.id}>
            <header>
              <strong>{entry.displayName}</strong>
              <time dateTime={entry.createdAt}>
                {formattedDate(entry.createdAt)}
              </time>
            </header>
            <p>{entry.message}</p>
          </article>
        ))}
        {loading && <p role="status">Reading the archive…</p>}
        {error && (
          <p role="status">
            {error}{" "}
            <button
              className="inline-button"
              type="button"
              onClick={() => void load(loaded ? cursor : null)}
            >
              Retry loading comments
            </button>
          </p>
        )}
        {cursor && !error && (
          <button
            type="button"
            className="text-link"
            disabled={loading}
            onClick={() => void load(cursor)}
          >
            Load more comments ↓
          </button>
        )}
      </div>
      <SubmissionForm id={id} kind="comment" target={target} />
    </div>
  );
}
export function ProjectDiscussion({
  id,
  target,
}: {
  id: string;
  target: CommentTarget;
}) {
  const [open, setOpen] = useState(false);
  const region = useRef<HTMLDetailsElement>(null);
  useDiscussionLayout(region);
  return (
    <details
      ref={region}
      className="project-comments"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        <span>
          Project notes <span className="muted">/ Comments</span>
        </span>
        <span aria-hidden="true">+</span>
      </summary>
      {open && <Comments id={id} target={target} />}
    </details>
  );
}
