import Link from "next/link";
export function PageHeading({
  label,
  title,
  description,
  back,
}: {
  label: string;
  title: string;
  description?: string;
  back?: { href: string; label: string };
}) {
  return (
    <header className="page-heading">
      <div className="page-label">
        <span className="eyebrow">{label}</span>
        {back && <Link href={back.href}>{back.label} ↗</Link>}
      </div>
      <h1 data-page-title>
        <span>{title}</span>
      </h1>
      {description && <p>{description}</p>}
    </header>
  );
}
