import { ArrowUpRight } from "lucide-react";
export function Footer() {
  return (
    <footer id="contact" className="site-footer">
      <div>
        <span className="eyebrow">03 / THE NEXT CONVERSATION</span>
        <h2>
          Good things begin
          <br />
          <span className="serif-word">with a hello.</span>
        </h2>
      </div>
      <p className="contact-status">
        <ArrowUpRight size={25} aria-hidden="true" />
        Contact form coming soon.
        <br />
        <span>Messaging and the guestbook are not yet available.</span>
      </p>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Otabek Rakhimov</span>
        <span>From Uzbekistan, with curiosity.</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
