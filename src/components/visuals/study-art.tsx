import { useId } from "react";
import type { StudyKind } from "@/data/archive";

/** Original geometric drawings, never stand-ins for photographs/screenshots. */
export function StudyArt({ kind = "volume" }: { kind?: StudyKind }) {
  const id = useId();
  if (kind === "contour")
    return (
      <svg viewBox="0 0 800 600" fill="none" aria-hidden="true">
        <rect width="800" height="600" fill="#344a66" />
        <g className="study-lines" stroke="#ddd8c9" strokeWidth="1.1">
          {Array.from({ length: 32 }, (_, i) => (
            <path
              key={i}
              opacity={0.3 + i * 0.018}
              d={`M${-150 + i * 22} 650 C${80 + i * 13} 430 ${80 + i * 17} 100 ${400 + i * 16} -50`}
            />
          ))}
        </g>
        <path d="M322 600V290a124 124 0 0 1 248 0v310" fill="#19252e" />
        <path
          d="M570 600V290a124 124 0 0 0-124-124"
          stroke="#bba382"
          strokeWidth="2"
        />
        <path d="M45 550h80m-40-40v80" stroke="#ddd8c9" />
      </svg>
    );
  if (kind === "balance")
    return (
      <svg viewBox="0 0 800 1000" aria-hidden="true">
        <rect width="800" height="1000" fill="#d8d0bf" />
        <path
          className="study-plane"
          d="M160 740 520 285 700 465 340 920Z"
          fill="#a65f44"
        />
        <circle
          className="study-orbit"
          cx="318"
          cy="440"
          r="174"
          fill="#292c26"
        />
        <path
          d="m144 440 348 0M318 266v348"
          stroke="#c9c2ad"
          strokeWidth="0.7"
          opacity=".3"
        />
        <path d="M83 120h634M83 880h634" stroke="#7d796e" strokeWidth="0.7" />
        <circle cx="660" cy="120" r="4" fill="#292c26" />
      </svg>
    );
  return (
    <svg viewBox="0 0 800 1000" fill="none" aria-hidden="true">
      <defs>
        <linearGradient
          id={`${id}-paper`}
          x1="195"
          y1="250"
          x2="620"
          y2="740"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#e4e0d2" />
          <stop offset=".5" stopColor="#aea897" />
          <stop offset="1" stopColor="#5d6053" />
        </linearGradient>
        <linearGradient
          id={`${id}-edge`}
          x1="195"
          y1="280"
          x2="550"
          y2="810"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#f2eee0" />
          <stop offset="1" stopColor="#8c927d" />
        </linearGradient>
      </defs>
      <rect width="800" height="1000" fill="#1b1f1a" />
      <path
        d="M96 890h610M125 90v820"
        stroke="#626653"
        strokeWidth=".7"
        opacity=".4"
      />
      <g className="study-volume">
        <path
          d="M179 295C390 180 548 172 637 264L607 749C440 651 337 715 194 810Z"
          fill={`url(#${id}-paper)`}
        />
        <path
          d="M179 295C330 384 431 419 637 264L607 749C431 900 330 898 194 810Z"
          fill={`url(#${id}-edge)`}
        />
        {Array.from({ length: 30 }, (_, i) => (
          <path
            key={i}
            className="volume-page"
            opacity={0.25 + i * 0.018}
            d={`M${179 + i * 0.52} ${295 + i * 16.9} C${330 + i * 0.2} ${384 + i * 16.8} ${431 - i * 0.12} ${419 + i * 16.4} ${637 - i} ${264 + i * 16.72}`}
            stroke="#2c3029"
            strokeWidth="1.2"
          />
        ))}
        <path
          d="M179 295C330 384 431 419 637 264"
          stroke="#f4f0e4"
          strokeWidth="1.6"
        />
        <path d="m194 810 6 24C340 920 450 920 610 770l-3-21" fill="#747866" />
      </g>
      <path
        d="M661 160h22m-11-11v22M84 902h20"
        stroke="#c7c9b7"
        strokeWidth="1"
      />
    </svg>
  );
}
