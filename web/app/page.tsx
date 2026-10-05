import Link from 'next/link';
import { cache, Suspense } from 'react';
import { Container } from '../components/container';
import { IconSearch } from '../components/icons';
import { MetricSkeleton, ResultSkeleton } from '../components/skeletons';
import { StateMessage } from '../components/state-message';
import { TenderResult } from '../components/tender-result';
import { getAuthorities, getTenders } from '../lib/api';
import { formatCount, kosovoToday, OFFICIAL_PORTAL_URL } from '../lib/format';
import { t } from '../lib/i18n';

const loadHome = cache(async () => {
  try {
    const today = kosovoToday();
    const [tracked, active, authorities] = await Promise.all([
      getTenders({ pageSize: 1 }),
      getTenders({ pageSize: 4, documentType: 'B05', closingAfter: today }),
      getAuthorities(),
    ]);
    return { tracked, active, authorities };
  } catch {
    return null;
  }
});

function HeroCopy() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-ink">{t.eyebrow}</p>
      <h1 className="mt-3 max-w-xl text-[2rem] font-semibold leading-[1.15] tracking-tight text-ink sm:text-5xl">{t.landingHero}</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted">{t.landingSubheading}</p>
      <form action="/tenders" method="get" role="search" className="mt-6">
        <label htmlFor="home-q" className="field-label">{t.homeSearchLabel}</label>
        <div className="flex flex-col gap-2 min-[480px]:flex-row">
          <div className="relative min-w-0 flex-1">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input id="home-q" name="q" placeholder={t.searchPlaceholder} autoComplete="off" enterKeyHint="search" className="field pl-10" />
          </div>
          <button type="submit" className="btn-primary shrink-0">{t.searchSubmit}</button>
        </div>
      </form>
      <div className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
        <Link href="/tenders" className="font-semibold text-accent-ink">{t.viewActive}</Link>
        <a href="#si-funksionon" className="text-muted hover:text-ink">{t.howItWorks}</a>
        <a href={OFFICIAL_PORTAL_URL} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-ink">{t.sourceLine}: e-prokurimi.rks-gov.net</a>
      </div>
    </div>
  );
}

async function HomeMetrics() {
  const data = await loadHome();
  if (!data) {
    return <StateMessage heading="h2" title={t.errorTitle} description={t.errorDescription} action={<Link href="/" className="btn-primary">{t.retry}</Link>} />;
  }

  const items = [
    { value: data.tracked.total, label: t.trackedLabel },
    { value: data.active.total, label: t.openLabel },
    { value: data.authorities.length, label: t.authorityLabel },
  ];

  return (
    <dl className="grid border border-line bg-panel min-[480px]:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="flex min-w-0 items-baseline justify-between gap-3 border-t border-line px-4 py-3 first:border-t-0 min-[480px]:block min-[480px]:border-l min-[480px]:border-t-0 min-[480px]:py-4 min-[480px]:first:border-l-0">
          <dd className="text-xl font-semibold tabular-nums tracking-tight text-ink sm:text-3xl">{formatCount(item.value)}</dd>
          <dt className="text-right text-xs leading-4 text-muted min-[480px]:mt-1 min-[480px]:text-left">{item.label}</dt>
        </div>
      ))}
    </dl>
  );
}

async function HomePreview() {
  const data = await loadHome();
  if (!data) return null;
  return (
    <section className="border-b border-line" aria-labelledby="live-preview">
      <Container className="py-8 lg:py-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="live-preview" className="text-xl font-semibold tracking-tight">{t.livePreview}</h2>
            <p className="mt-1 text-sm text-muted">{t.livePreviewDescription}</p>
          </div>
          <Link href="/tenders" className="text-sm font-semibold text-accent-ink">{t.viewAll}</Link>
        </div>
        {data.active.data.length === 0 ? (
          <p className="border border-line bg-panel px-4 py-8 text-sm text-muted">{t.noPreview}</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-line bg-panel">
            {data.active.data.map((tender) => <TenderResult key={tender.id} tender={tender} />)}
          </div>
        )}
      </Container>
    </section>
  );
}

export default function HomePage() {
  return (
    <main>
      <section className="border-b border-line">
        <Container className="grid items-start gap-8 py-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,24rem)] lg:py-12">
          <HeroCopy />
          <Suspense fallback={<div className="animate-pulse"><MetricSkeleton /></div>}>
            <HomeMetrics />
          </Suspense>
        </Container>
      </section>

      <Suspense fallback={<Container className="py-8"><div className="animate-pulse"><ResultSkeleton /></div></Container>}>
        <HomePreview />
      </Suspense>

      <section id="si-funksionon" className="py-8 lg:py-10" aria-labelledby="how-it-works">
        <Container>
          <h2 id="how-it-works" className="text-xl font-semibold tracking-tight">{t.howItWorks}</h2>
          <ol className="mt-5 grid gap-5 md:grid-cols-3">
            {[t.howStepOne, t.howStepTwo, t.howStepThree].map((step, index) => (
              <li key={step} className="border-t border-line pt-4">
                <span className="font-mono text-sm text-accent-ink">{`0${index + 1}`}</span>
                <p className="mt-2 text-sm leading-6 text-ink">{step}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </main>
  );
}
