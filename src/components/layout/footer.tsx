import { OpenMessage } from "@/components/contact/open-message";
import { site } from "@/data/site";
import { profile } from "@/data/portfolio";
import Link from "next/link";
export function Footer() {
  return (
    <footer
      id="contact"
      className="site-footer"
      aria-labelledby="contact-heading"
    >
      <div className="section-label">
        <span aria-hidden="true">—</span>09 / CORRESPONDENCE
      </div>
      <div className="contact-heading">
        <h2 id="contact-heading">{site.contact.heading}</h2>
      </div>
      <div className="contact-bottom">
        <p>{site.contact.description}</p>
        <div className="contact-actions">
          <OpenMessage />
          <Link href="/guestbook">{site.contact.guestbook} ↗</Link>
          {profile.socialLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      </div>
      <noscript>
        <p className="archive-notice">
          Enable JavaScript to send a private message. The archive remains
          readable without it.
        </p>
      </noscript>
      <div className="footer-wordmark" aria-hidden="true">
        {site.brand}
        <span>.</span>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {site.brand} / {profile.name}
        </span>
        <span>{profile.country.toUpperCase()} · A PERSONAL ARCHIVE</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
