import styles from "./product-exhibit.module.css";

/** Portfolio interpretations, using verified subject names and interface vocabulary. */
export function ProductExhibit({ id }: { id: "sat-chi" | "huquq-test" }) {
  if (id === "sat-chi") return (
    <div className={`${styles.product} ${styles.sat}`} aria-label="Art-directed SAT’chi study poster; not an application screenshot">
      <div className={styles.learningBoard} data-product-main>
        <div className={styles.boardTop}><span>SAT’chi / Preparation</span><span aria-hidden>↗</span></div>
        <p className={styles.boardTitle}>Prepare<br /><em>smarter.</em></p>
        <div className={styles.subjects}><span>Reading &amp; Writing</span><span>Mathematics</span></div>
        <div className={styles.choices} aria-hidden>{["A", "B", "C", "D"].map((v, i) => <span key={v} className={i === 1 ? styles.chosen : ""}>{v}</span>)}</div>
      </div>
      <div className={styles.journey} data-product-detail>
        <span className={styles.journeyIndex}>A learning journey</span>
        <p><span>01</span> Set your direction</p><p><span>02</span> Build your routine</p><p><span>03</span> Keep moving</p>
        <span className={styles.journeyArrow} aria-hidden>↗</span>
      </div>
      <span className={styles.tab} aria-hidden>think<br />again.</span>
    </div>
  );
  return (
    <div className={`${styles.product} ${styles.huquq}`} aria-label="Art-directed Huquq Test examination folio; not an application screenshot">
      <div className={styles.paperBack} data-product-detail><span>YANGIARIQ<br />YURIDIK SENTER</span><b aria-hidden>?</b><small>Examination / Interface study</small></div>
      <div className={styles.paperFront} data-product-main>
        <header><span>Huquq Test</span><span>Portfolio study / 02</span></header>
        <p className={styles.paperTitle}>Bilim.<br /><em>Sinov.</em></p>
        <div className={styles.paperRule} />
        <span className={styles.paperLabel}>Barcha savollar</span>
        <div className={styles.questionGrid} aria-hidden>{Array.from({ length: 24 }, (_, i) => <span key={i}>{String(i + 1).padStart(2, "0")}</span>)}</div>
        <footer><span>Read. Consider. Respond.</span><span aria-hidden>↗</span></footer>
      </div>
    </div>
  );
}
