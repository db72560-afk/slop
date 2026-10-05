import Link from 'next/link';
import { TenderCard } from '../components/tender-card';
import { getAuthorities, getTenders } from '../lib/api';
import { t } from '../lib/i18n';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function LandingPage() {
  let tracked;
  let active;
  let authorities;
  try {
    [tracked, active, authorities] = await Promise.all([
      getTenders({ pageSize: 1 }),
      getTenders({ pageSize: 1, documentType: 'B05', closingAfter: today() }),
      getAuthorities(),
    ]);
  } catch {
    return <main className="shell"><div className="error-panel"><p className="eyebrow">{t.brand}</p><h1>{t.errorTitle}</h1><p>{t.errorDescription}</p><Link href="/" className="button-primary">{t.retry}</Link></div></main>;
  }

  return (
    <main>
      <section className="landing-hero">
        <div className="shell landing-hero-inner">
          <div className="max-w-4xl">
            <p className="eyebrow">{t.eyebrow}</p>
            <h1 className="landing-title">{t.landingHero}</h1>
            <p className="landing-subtitle">{t.landingSubheading}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/tenders" className="button-primary">{t.viewActive} <span aria-hidden="true" className="ml-2">→</span></Link>
              <a href="#si-funksionon" className="button-secondary">{t.howItWorks} <span aria-hidden="true" className="ml-2">↓</span></a>
            </div>
            <div className="trust-row mt-10">
              <span className="trust-chip"><i />{t.officialSource}</span>
              <span className="trust-chip"><i />{tracked.total} {t.trackedLive}</span>
              <span className="trust-chip"><i />{active.total} {t.openLive}</span>
            </div>
          </div>
          <div className="hero-signal" aria-hidden="true"><span>e</span><div /><div /><div /></div>
        </div>
      </section>

      <section id="si-funksionon" className="section-shell section-band">
        <div className="section-heading"><p className="eyebrow">01 / {t.howItWorks}</p><h2>{t.officialData}</h2></div>
        <div className="steps-grid">
          <div className="step-card"><span className="step-icon">01</span><h3>{t.howStepOne}</h3></div>
          <div className="step-card"><span className="step-icon">02</span><h3>{t.howStepTwo}</h3></div>
          <div className="step-card"><span className="step-icon">03</span><h3>{t.howStepThree}</h3></div>
        </div>
      </section>

      <section className="section-shell section-band pt-0">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div className="section-heading"><p className="eyebrow">02 / {t.livePreview}</p><h2>{t.livePreview}</h2><p>{t.livePreviewDescription}</p></div>
          <Link href="/tenders" className="back-link">{t.viewAll} →</Link>
        </div>
        <div className="results-stack mt-7">
          {active.data.slice(0, 4).map((tender) => <TenderCard key={tender.id} tender={tender} />)}
        </div>
      </section>

      <section className="section-shell section-band pt-0">
        <div className="section-heading"><p className="eyebrow">03 / {t.whyTitle}</p><h2>{t.whyTitle}</h2></div>
        <div className="feature-grid">
          <div className="feature-card"><span className="feature-mark">↗</span><h3>{t.featureTypes}</h3><p>{t.featureTypesDescription}</p></div>
          <div className="feature-card"><span className="feature-mark">◷</span><h3>{t.featureDeadlines}</h3><p>{t.featureDeadlinesDescription}</p></div>
          <div className="feature-card"><span className="feature-mark">⌕</span><h3>{t.featureFilters}</h3><p>{t.featureFiltersDescription}</p></div>
          <div className="feature-card"><span className="feature-mark">{authorities.length}</span><h3>{t.authorities}</h3><p>{t.officialData}</p></div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="section-shell footer-inner">
          <div><Link href="/" className="wordmark"><span className="wordmark-mark">e</span><span>{t.brand}</span></Link><p className="footer-note">{t.independentProject}</p></div>
          <div className="footer-links"><Link href="/tenders">{t.navNotices}</Link><Link href="/about">{t.about}</Link><Link href="/contact">{t.contact}</Link></div>
        </div>
      </footer>
    </main>
  );
}
