import type { ProjectId } from "@/data/portfolio";
// Shared visitor contracts. Persistence and authorization stay on the server.
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
