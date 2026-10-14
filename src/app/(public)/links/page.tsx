import type { Metadata } from "next";
import { publicIdentities, universeCopy } from "@/data/universe";
import { site } from "@/data/site";
import { PageHeading } from "@/components/universe/page-heading";
import { IdentityDirectory } from "@/components/universe/identity-directory";
export const metadata: Metadata = { title: `Links — ${site.brand}` };
export default function LinksPage() {
  const entries = publicIdentities
    .filter((link) => link.visible && link.verified)
    .sort((a, b) => a.order - b.order);
  return (
    <div className="inner-page links-page">
      <PageHeading
        label="05 / MY CORNER OF THE INTERNET"
        title={universeCopy.links.title}
        description={universeCopy.links.description}
      />
      <IdentityDirectory entries={entries} />
      <div className="page-afterword">
        <span className="eyebrow">AN INCOMPLETE MAP</span>
        <p>
          Other public social, coding and gaming profiles can join this
          directory once their links are confirmed. Private login and recovery
          details stay outside it.
        </p>
      </div>
    </div>
  );
}
