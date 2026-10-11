import type { ProjectId } from "@/data/portfolio";
// Future domain contracts only. No persistence or submission exists in Phase 1.
export type CommentTarget =
  { kind: "project"; projectId: ProjectId } | { kind: "guestbook" };
export type ModerationStatus = "pending" | "approved" | "rejected";
export interface PublicComment {
  id: string;
  displayName: string;
  message: string;
  target: CommentTarget;
  createdAt: string;
}
export interface ContactDraft {
  name: string;
  replyContact?: string;
  message: string;
}
export interface CommentDraft {
  displayName: string;
  message: string;
  target: CommentTarget;
}
export type SubmissionStatus = "idle" | "submitting" | "success" | "error";
