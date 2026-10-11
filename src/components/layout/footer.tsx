import { ArrowUpRight } from "lucide-react";
import { FoldMark } from "@/components/visuals/fold-mark";
import { site } from "@/data/site";
import { profile } from "@/data/portfolio";
export function Footer() {
  return (
    <footer
      id="contact"
      className="site-footer"
      aria-labelledby="contact-heading"
    >
      <div className="section-label">
        <span aria-hidden="true">+</span>06 / KEEP THE CONVERSATION OPEN
      </div>
      <div className="contact-heading">
        <h2 id="contact-heading">
          Have a thought?
          <br />
          <span className="serif-word">Leave a little of it.</span>
        </h2>
        <FoldMark className="contact-fold" />
      </div>
      <div className="contact-bottom">
        <p>
          About the work, an idea, or a question.
          <br />
          <span>
            Private messaging will open in a later phase.
            <br />
            No account will be needed.
          </span>
        </p>
        <a className="text-link" href="#guestbook">
          Visit the guestbook <ArrowUpRight size={19} aria-hidden="true" />
        </a>
      </div>
      <div className="footer-wordmark" aria-hidden="true">
        {site.brand}
        <span>.</span>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {site.brand} / {profile.name}
        </span>
        <span>UZBEKISTAN · A WORKING ARCHIVE</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
