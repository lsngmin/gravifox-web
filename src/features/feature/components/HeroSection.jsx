import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRightAlt } from '@mui/icons-material';

const HeroSection = () => {
  const { t } = useTranslation('feature');

  return (
    <section className="relative overflow-hidden pt-24 sm:pt-32 pb-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.28),_transparent_55%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/90 via-white/50 to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-6 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-indigo-600 shadow-sm ring-1 ring-indigo-200/60">
          {t('hero.ribbon', 'AI-FIRST DEFENSE STACK')}
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-slate-900">
              {t(
                'hero.title',
                'GenAI image intelligence for trust & safety leaders'
              )}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-xl">
              {t(
                'hero.subtitle',
                'GraviFox orchestrates multimodal detection, automated triage, and investigator workflows so you can neutralize synthetic media threats before they spread.'
              )}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
              <a
                href="/en/free-trial"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-slate-800"
              >
                {t('hero.primaryCta', 'Request live demo')}
                <ArrowRightAlt className="ml-2 h-5 w-5" />
              </a>
              <a
                href="/en/docs"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300/70 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-white"
              >
                {t('hero.secondaryCta', 'Explore tech stack')}
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-xl shadow-indigo-200/40">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.2),_transparent_70%)]" aria-hidden="true" />
            <div className="relative grid gap-4 text-left">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                  {t('hero.snapshot.title', 'Snapshot: live operations')}
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{t('hero.snapshot.value', '6,482 incidents neutralised')}</p>
                <p className="text-xs text-slate-500">{t('hero.snapshot.caption', 'Last 30 days across enterprise tenants')}</p>
              </div>
              <div className="h-px bg-slate-200" />
              <div className="grid gap-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>{t('hero.snapshot.metrics.highConfidence', 'High confidence takedowns')}</span>
                  <span className="font-semibold text-emerald-500">92%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('hero.snapshot.metrics.falsePositives', 'False positive replays')}</span>
                  <span className="font-semibold text-rose-500">0.8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('hero.snapshot.metrics.coverage', 'Coverage across surfaces')}</span>
                  <span className="font-semibold text-indigo-500">14 regions</span>
                </div>
              </div>
              <div className="mt-2 rounded-2xl bg-slate-900/90 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-indigo-100 shadow-lg">
                {t('hero.snapshot.footer', 'Continuous learning cohorts refresh every 18 hours')}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent via-white/70 to-white"
        aria-hidden="true"
      />
    </section>
  );
};

export default HeroSection;
