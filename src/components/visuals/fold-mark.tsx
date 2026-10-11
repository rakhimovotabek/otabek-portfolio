// Original geometric study: a sheet folded into an open architectural frame.
export function FoldMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 440 360"
      fill="none"
      aria-hidden="true"
    >
      <path d="M82 101 279 28 370 88 173 162Z" fill="currentColor" />
      <path
        d="m173 162 197-74-42 177-196 74Z"
        fill="currentColor"
        opacity=".75"
      />
      <path d="m82 101 91 61-41 177-90-62Z" fill="currentColor" opacity=".42" />
      <path d="m151 141 104-39 47 30-103 39-23 97-46-30Z" fill="var(--ink)" />
      <path d="m151 141 48 30-23 97-46-30Z" fill="var(--surface)" />
      <path
        d="M82 101 173 162 132 339M173 162 370 88"
        stroke="var(--ink)"
        strokeOpacity=".45"
      />
      <path
        d="M23 330h75M377 28v62"
        stroke="currentColor"
        strokeOpacity=".45"
      />
    </svg>
  );
}
