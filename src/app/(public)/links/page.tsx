import type { Metadata } from "next";
import { Link as LinkIcon, Mail } from "lucide-react";
import { publicIdentities, universeCopy } from "@/data/universe";
import { site } from "@/data/site";
import { PageHeading } from "@/components/universe/page-heading";
export const metadata: Metadata = { title: `Links — ${site.brand}` };
const categories = [
  { id: "code", title: "Code & projects" },
  { id: "social", title: "Social & personal" },
  { id: "gaming", title: "Games & play" },
  { id: "contact", title: "Contact" },
  { id: "other", title: "Elsewhere" },
];
const icons = { github: LinkIcon, link: LinkIcon, mail: Mail };
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
      <div className="identity-directory">
        {categories.map((category) => {
          const links = entries.filter(
            (entry) => entry.category === category.id,
          );
          if (!links.length) return null;
          return (
            <section
              key={category.id}
              aria-labelledby={`${category.id}-heading`}
            >
              <h2 id={`${category.id}-heading`}>{category.title}</h2>
              <div>
                {links.map((link) => {
                  const Icon = icons[link.icon ?? "link"];
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="identity-link"
                    >
                      <Icon size={23} aria-hidden="true" />
                      <span className="identity-platform">
                        {link.platform}
                        <small>{link.profileName}</small>
                      </span>
                      <span className="identity-description">
                        {link.description}
                      </span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
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
