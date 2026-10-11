import type { Metadata } from "next";
import { Guestbook } from "@/components/sections/guestbook";
import { PageHeading } from "@/components/universe/page-heading";
import { site } from "@/data/site";
export const metadata: Metadata = { title: `Guestbook — ${site.brand}` };
export default function GuestbookPage() {
  return (
    <div className="inner-page guestbook-page">
      <PageHeading
        label="06 / PUBLIC IMPRESSIONS"
        title="A trace of your visit."
        description="Leave a thought about this little corner of the internet. No account needed; entries are reviewed before appearing."
      />
      <Guestbook />
    </div>
  );
}
