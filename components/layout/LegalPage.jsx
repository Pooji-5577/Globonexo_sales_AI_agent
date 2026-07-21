import Link from "next/link";
import PublicFooter from "./PublicFooter";

const slugify = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default function LegalPage({ title, updated, sections }) {
  return (
    <div className="public-page">
      <main className="legal-page public-section">
        <header className="legal-hero">
          <div>
            <Link className="legal-back" href="/">Back to home</Link>
            <span className="eyebrow">Legal</span>
          </div>
          <h1 className="display">{title}</h1>
          <p className="legal-updated">Last updated: {updated}</p>
        </header>

        <div className="legal-layout">
          <aside className="legal-toc" aria-label={`${title} sections`}>
            <span>On this page</span>
            {sections.map((section) => (
              <a key={section.title} href={`#${slugify(section.title)}`}>
                {section.title.replace(/^\d+\.\s*/, "")}
              </a>
            ))}
          </aside>

          <article className="legal-card">
            {sections.map((section) => (
              <section key={section.title} id={slugify(section.title)}>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </section>
            ))}
          </article>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
