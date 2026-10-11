import type { ReactNode } from "react";
export function Section({
  id,
  label,
  children,
  className = "",
}: {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`section ${className}`}
    >
      <div className="section-label">
        <span aria-hidden="true">+</span>
        {label}
      </div>
      {children}
    </section>
  );
}
