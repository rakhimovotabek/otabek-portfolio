import { z } from "zod";
import { projects } from "../../data/portfolio";

const name = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .refine((v) => !/[\u0000-\u001f\u007f]/u.test(v));
const text = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)
    .refine((v) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(v));
export const projectIdSchema = z
  .string()
  .refine((id) => projects.some((p) => p.id === id));
export const targetSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("guestbook") }).strict(),
  z.object({ kind: z.literal("project"), projectId: projectIdSchema }).strict(),
]);
const spamFields = {
  website: z.string().max(200).optional().default(""),
  turnstileToken: z.string().min(1).max(2048),
};
export const contactSchema = z
  .object({
    name,
    replyContact: z
      .string()
      .trim()
      .max(254)
      .refine((v) => !/[\u0000-\u001f\u007f]/u.test(v))
      .optional(),
    message: text(10, 4000),
    ...spamFields,
  })
  .strict();
export const commentSchema = z
  .object({
    displayName: name,
    message: text(3, 2000),
    target: targetSchema,
    ...spamFields,
  })
  .strict();
export const moderationSchema = z
  .object({ status: z.enum(["approved", "rejected"]) })
  .strict();
export const messageStatusSchema = z
  .object({ status: z.enum(["unread", "read", "archived"]) })
  .strict();
export const idSchema = z.uuid();
const cursorSchema = z
  .object({ createdAt: z.iso.datetime({ offset: true }), id: idSchema })
  .strict();
export type Cursor = z.infer<typeof cursorSchema>;
export function encodeCursor(row: { id: string; created_at: string }) {
  return Buffer.from(
    JSON.stringify({ id: row.id, createdAt: row.created_at }),
  ).toString("base64url");
}
export function decodeCursor(value: string | null): Cursor | undefined {
  if (value === null) return;
  if (value.length > 256 || !/^[A-Za-z0-9_-]+$/.test(value))
    throw new Error("Invalid cursor");
  return cursorSchema.parse(
    JSON.parse(Buffer.from(value, "base64url").toString()),
  );
}
export type CommentInput = z.infer<typeof commentSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type Target = z.infer<typeof targetSchema>;
export type MessageStatus = z.infer<typeof messageStatusSchema>["status"];
export type Moderation = z.infer<typeof moderationSchema>["status"];
