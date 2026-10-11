import type { MessageStatus, Moderation } from "./validation";

export type MessageRow = {
  id: string;
  name: string;
  reply_contact: string | null;
  message: string;
  status: MessageStatus;
  created_at: string;
};
export type CommentRow = {
  id: string;
  target_type: "project" | "guestbook";
  target_id: string | null;
  author_name: string;
  content: string;
  status: Moderation | "pending";
  created_at: string;
  updated_at: string;
};
export type PublicCommentRow = Pick<
  CommentRow,
  "id" | "target_type" | "target_id" | "author_name" | "content" | "created_at"
>;
type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};
export type Database = {
  public: {
    Tables: {
      portfolio_projects: Table<
        { id: string },
        { id: string },
        { id?: string }
      >;
      contact_messages: Table<
        MessageRow,
        Pick<MessageRow, "name" | "reply_contact" | "message">,
        { status?: MessageStatus }
      >;
      comments: Table<
        CommentRow,
        Pick<
          CommentRow,
          "target_type" | "target_id" | "author_name" | "content"
        >,
        { status?: Moderation }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      is_portfolio_owner_identity: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_portfolio_owner: { Args: Record<string, never>; Returns: boolean };
      consume_submission_limit: {
        Args: { p_subject_hash: string };
        Returns: boolean;
      };
      purge_submission_limits: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
