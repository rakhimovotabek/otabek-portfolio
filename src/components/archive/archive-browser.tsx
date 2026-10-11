"use client";
import { useRef, useState, useSyncExternalStore } from "react";
import type { ArchiveEntry } from "@/data/archive";
import { categoryLabels } from "@/data/archive";
import { MediaFrame } from "./media-frame";
import { useDiscussionLayout } from "@/components/community/use-discussion-layout";

const subscribe = () => () => {};
const groups = ["All", "Words", "Images"] as const;
export function ArchiveBrowser({
  entries,
}: {
  entries: readonly ArchiveEntry[];
}) {
  const [group, setGroup] = useState<(typeof groups)[number]>("All");
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const root = useRef<HTMLDivElement>(null);
  useDiscussionLayout(root);
  const filtered = entries.filter(
    (item) =>
      group === "All" ||
      (group === "Words"
        ? ["essay", "poem", "note", "talk"].includes(item.category)
        : ["photograph", "drawing", "sketch", "visual-experiment"].includes(
            item.category,
          )),
  );
  return (
    <div className="archive-browser" ref={root}>
      <div className="archive-tools">
        <div role="group" aria-label="Filter archive">
          {groups.map((g) => (
            <button
              key={g}
              type="button"
              disabled={!ready}
              aria-pressed={g === group}
              onClick={() => setGroup(g)}
            >
              {g}
            </button>
          ))}
        </div>
        <span className="eyebrow" role="status">
          {filtered.length} ENTRIES / STUDIES & RESERVED PAGES
        </span>
      </div>
      <noscript>
        <p className="archive-notice">
          All entries are available below. Filtering requires JavaScript.
        </p>
      </noscript>
      <div className="archive-list">
        {filtered.map((entry) => (
          <details
            className="archive-entry"
            key={entry.id}
            id={`archive-${entry.id}`}
          >
            <summary>
              <span className="archive-year">{entry.year ?? "—"}</span>
              <h3>{entry.title}</h3>
              <span className="archive-category">
                {categoryLabels[entry.category]}
              </span>
              <span className="archive-entry-status">
                {entry.status === "site-study"
                  ? "SITE STUDY"
                  : entry.status === "placeholder"
                    ? "RESERVED"
                    : entry.status.toUpperCase()}
              </span>
              <span className="archive-expand" aria-hidden="true">
                +
              </span>
            </summary>
            <div className="archive-entry-body">
              {entry.preview && (
                <MediaFrame
                  media={entry.preview}
                  sizes="(max-width: 700px) 85vw, 30vw"
                />
              )}
              <div>
                <p>{entry.description}</p>
                {entry.excerpt && <blockquote>{entry.excerpt}</blockquote>}
                {entry.link && (
                  <a
                    className="text-link"
                    href={entry.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open work ↗
                  </a>
                )}
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
