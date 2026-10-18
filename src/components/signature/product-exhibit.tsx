import Image from "next/image";
import styles from "./product-exhibit.module.css";

/** Captured public interfaces. The exam navigator is explicitly a source-rendered demo. */
export function ProductExhibit({ id }: { id: "sat-chi" | "huquq-test" }) {
  const sat = id === "sat-chi";
  return (
    <div className={`${styles.product} ${sat ? styles.sat : styles.huquq}`}>
      <div className={styles.main} data-product-main>
        <span className={styles.label}>{sat ? "01 / The starting point" : "01 / Yangiariq Yuridik Senter"}</span>
        <Image unoptimized loading="eager" src={`/images/work/${sat ? "sat-landing" : "huquq-sign-in"}.webp`}
          width={sat ? 1800 : 720} height={sat ? 942 : 564}
          alt={sat ? "SAT’chi’s real public landing page, with its study journey and preparation introduction" : "Yangiariq Yuridik Senter’s real public sign-in interface in Uzbek"}
          sizes="(max-width: 799px) 85vw, 58vw" />
      </div>
      <div className={styles.detail} data-product-detail>
        <span className={styles.label}>{sat ? "02 / Sign in" : "02 / Question navigation · component demo"}</span>
        <Image unoptimized loading="eager" src={`/images/work/${sat ? "sat-sign-in" : "huquq-navigator-demo"}.webp`}
          width={sat ? 860 : 1120} height={sat ? 1256 : 556}
          alt={sat ? "SAT’chi’s real sign-in screen" : "Original question navigator rendered from Huquqchi source code with demonstration question numbers; no student or exam data"}
          sizes="(max-width: 799px) 45vw, 30vw" />
      </div>
    </div>
  );
}
