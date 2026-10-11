import type { ProjectId } from "@/data/portfolio";
export function ProjectArt({ id }: { id: ProjectId }) {
  switch (id) {
    case "sat-chi":
      return (
        <div className="artwork sat-art" aria-hidden="true">
          <div className="art-meta">
            <span>THE LEARNING STUDY</span>
            <span>01 / EDUCATION</span>
          </div>
          <div className="sat-letters">
            SAT<span>’chi</span>
          </div>
          <svg className="sat-geometry" viewBox="0 0 500 600" fill="none">
            {Array.from({ length: 18 }, (_, i) => (
              <path
                key={i}
                d={`M${30 + i * 19} 600V${300 - i * 12}Q${245 + i * 8} ${40 + i * 6} 500 ${190 + i * 18}`}
                stroke="currentColor"
                strokeWidth="1"
              />
            ))}
            <path
              d="M70 510h355M250 555V190"
              stroke="currentColor"
              opacity=".5"
            />
          </svg>
          <div className="sat-bottom">
            <span>
              READ.
              <br />
              REASON.
              <br />
              REPEAT.
            </span>
            <span className="sat-equation">x → possibility</span>
          </div>
        </div>
      );
    case "huquq-test":
      return (
        <div className="artwork huquq-art" aria-hidden="true">
          <span className="art-meta">A STUDY IN STRUCTURE</span>
          <svg viewBox="0 0 600 380" fill="none">
            <path
              d="M300 55v250M150 145h300M235 325h130"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              d="m150 145-65 105h130ZM450 145l-65 105h130Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M85 260h130M385 260h130"
              stroke="currentColor"
              strokeWidth="18"
            />
            <circle cx="300" cy="145" r="12" fill="currentColor" />
          </svg>
          <div className="huquq-type">
            huquq<span>test</span>
          </div>
          <span className="art-corner">ORDER / BALANCE</span>
        </div>
      );
    case "sme-financial-assistant":
      return (
        <div className="artwork sme-art" aria-hidden="true">
          <span className="art-meta">SMALL BUSINESS. BIG QUESTIONS.</span>
          <svg viewBox="0 0 600 420" fill="none">
            <path
              d="M90 360V255h105v105M195 360V185h105v175M300 360V110h105v250M405 360V40h105v320"
              stroke="currentColor"
              strokeWidth="2"
            />
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                d={`M${90 + i * 105} ${255 - i * 72}l45 -26h105l-45 26`}
                fill="currentColor"
                opacity={0.25 + i * 0.16}
              />
            ))}
            <path d="M55 360h490" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span className="sme-type">
            room
            <br />
            <i>to grow.</i>
          </span>
          <span className="art-corner">FINANCIAL PLANNING / CONCEPT STUDY</span>
        </div>
      );
    case "telegram-media-downloader":
      return (
        <div className="artwork telegram-art" aria-hidden="true">
          <span className="art-meta">FROM A LINK TO A FILE</span>
          <div className="paper-stack">
            <span />
            <span />
            <span>
              <svg viewBox="0 0 180 210" fill="none">
                <path
                  d="M90 35v100m-40-40 40 40 40-40M40 158v20h100v-20"
                  stroke="currentColor"
                  strokeWidth="9"
                />
              </svg>
            </span>
          </div>
          <span className="telegram-type">
            ↓<br />
            download.
          </span>
          <span className="art-corner">PYTHON / TELEGRAM</span>
        </div>
      );
    case "ielts-progress-tracker":
      return (
        <div className="artwork ielts-art" aria-hidden="true">
          <span className="art-meta">THE PRACTICE OF PROGRESS</span>
          <svg viewBox="0 0 600 420" fill="none">
            {Array.from({ length: 9 }, (_, i) => (
              <path
                key={i}
                d={`M${80 + i * 24} 390V${160 + i * 17}a${210 - i * 24} ${210 - i * 24} 0 0 1 ${420 - i * 48} 0v${230 - i * 17}`}
                stroke="currentColor"
                strokeWidth="3"
              />
            ))}
          </svg>
          <span className="ielts-type">
            a little.
            <br />
            <i>then more.</i>
          </span>
          <span className="art-corner">IELTS / LEARNING JOURNEY</span>
        </div>
      );
  }
}
