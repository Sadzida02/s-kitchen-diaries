import type { LegalDoc } from "@/lib/legal";
import styles from "./LegalPage.module.css";

// A plain reading page for the privacy policy and the terms of use.
export default function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <section className="section">
      <div className={`container ${styles.page}`}>
        <div className="section-head">
          <p className="kicker">{doc.kicker}</p>
          <h1>{doc.title}</h1>
          <p>{doc.updated}</p>
        </div>
        {doc.sections.map((section) => (
          <section key={section.heading} className={styles.block}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </section>
        ))}
      </div>
    </section>
  );
}
