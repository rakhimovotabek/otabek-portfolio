/** Original conceptual objects. No protected questions or product metrics. */
export function PortalArt() {
  return (
    <div className="od-portal" aria-hidden="true">
      <div className="od-portal-rings" />
      <div className="od-portal-void" />
      <div className="od-question-leaf">
        <small>A QUESTION</small>
        <strong>why?</strong>
        <span>is a place to begin.</span>
      </div>
    </div>
  );
}
export function LearningArt({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`od-learning-art${compact ? " od-art-compact" : ""}`}
      role="img"
      aria-label="Concept artwork: an oversized question mark, angled practice sheet and an answer selection motif. Not an application screenshot."
    >
      <span className="od-question-mark" aria-hidden="true">
        ?
      </span>
      <div className="od-book-spine" aria-hidden="true">
        <span>THE PLEASURE OF</span>
        <b>
          A DIFFICULT
          <br />
          QUESTION.
        </b>
      </div>
      <div className="od-answer-sheet" aria-hidden="true">
        <div className="od-sheet-top">
          <span>SAT’chi</span>
          <span>PRACTICE / STUDY</span>
        </div>
        <div className="od-equation">
          x<span>+</span>y<span>=</span>?
        </div>
        <div className="od-answer-line">
          <span>A</span>
          <i />
          <span>B</span>
          <i className="od-selected-answer" />
          <span>C</span>
          <i />
          <span>D</span>
          <i />
        </div>
        <div className="od-sheet-rule" />
        <small>ONE QUESTION AT A TIME.</small>
        <svg viewBox="0 0 400 90" fill="none">
          <path
            data-learning-trace
            d="M0 70H65V45H145V60H205V15H290V35H400"
            stroke="currentColor"
            strokeWidth="2"
            pathLength="1"
          />
        </svg>
        <span className="od-sheet-foot">A STUDY IN LEARNING</span>
      </div>
      <span className="od-art-caption">ORIGINAL CONCEPT ARTWORK</span>
    </div>
  );
}
export function LawArt() {
  return (
    <div
      className="od-law-art"
      role="img"
      aria-label="Concept artwork: an open law examination folio with ruled paper and a typographic section mark. No official affiliation."
    >
      <div className="od-folio-back" aria-hidden="true">
        <span>
          HUQUQ
          <br />
          TEST
        </span>
        <i>
          Questions.
          <br />
          Considered.
        </i>
      </div>
      <div className="od-folio-page" aria-hidden="true">
        <div className="od-sheet-top">
          <span>EXAMINATION FOLIO</span>
          <span>H / T</span>
        </div>
        <b className="od-section-mark">§</b>
        <div className="od-law-rules">
          <i />
          <i />
          <i />
          <i />
        </div>
        <span className="od-folio-stamp">
          A STUDY IN
          <br />
          EXAMINATION
        </span>
        <small>INDEPENDENT PROJECT / CONCEPT ARTWORK</small>
      </div>
      <span className="od-art-caption">
        ORIGINAL FOLIO / NO OFFICIAL AFFILIATION
      </span>
    </div>
  );
}
