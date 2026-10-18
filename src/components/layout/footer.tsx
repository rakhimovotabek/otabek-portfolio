import { OpenMessage } from "@/components/contact/open-message";
import { site } from "@/data/site";
import { profile } from "@/data/portfolio";
import { TransitionLink as Link } from "@/components/motion/route-transitions";
import { QuietDiscovery } from "@/components/universe/quiet-discovery";
export function Footer() {
  return (
    <footer
      id="contact"
      className="od-footer"
      aria-labelledby="contact-heading"
    >
      <div className="od-footer-top">
        <div>
          <span className="od-kicker">YOU’VE REACHED THE OTHER SIDE.</span>
          <h2 id="contact-heading">
            A little
            <br />
            <em>correspondence?</em>
          </h2>
          <OpenMessage />
        </div>
        <div className="od-footer-side">
          <p>A question, a thought about the work, or simply a hello.</p>
          <Link href="/guestbook">Leave a public trace →</Link>
          <Link href="/links">Find me elsewhere →</Link>
        </div>
      </div>
      <noscript>
        <p>
          Enable JavaScript to send a private note. All archive pages remain
          readable.
        </p>
      </noscript>
      <div className="od-footer-bottom">
        <QuietDiscovery />
        <span>
          © {new Date().getFullYear()} {profile.name} / {site.brand}
        </span>
        <span>{profile.country} · A personal archive</span>
        <a href="#top">Back to the beginning ↑</a>
      </div>
    </footer>
  );
}
