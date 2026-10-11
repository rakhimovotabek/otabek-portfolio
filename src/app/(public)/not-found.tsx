import { TransitionLink as Link } from "@/components/motion/route-transitions";
export default function ArchiveNotFound() {
  return (
    <div className="inner-page">
      <header className="page-heading">
        <span className="eyebrow">404 / A MISSING PAGE</span>
        <h1>This page isn’t here.</h1>
        <p>It may be unpublished, or the address may have changed.</p>
        <Link className="text-link" href="/">
          Return to the opening ↗
        </Link>
      </header>
    </div>
  );
}
