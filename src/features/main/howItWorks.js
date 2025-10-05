import React from 'react';
import { useTranslation } from 'react-i18next';
import { CloudUpload, Terminal, AutoAwesomeMotion } from '@mui/icons-material';

const steps = [
  {
    key: 'ingest',
    icon: CloudUpload,
    annotation: '00:00:00',
    glideKey: 'how.steps.upload',
  },
  {
    key: 'analyze',
    icon: Terminal,
    annotation: '00:00:03',
    glideKey: 'how.steps.api',
  },
  {
    key: 'respond',
    icon: AutoAwesomeMotion,
    annotation: '00:00:09',
    glideKey: 'how.steps.result',
  },
];

export default function HowItWorks() {
  const { t } = useTranslation('home');

  return (
    <section id="how" className="relative isolate overflow-hidden py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
            {t('how.eyebrow', 'How It Works')}
          </h3>
          <p className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            {t('how.title', 'Analyze in 3 simple steps')}
          </p>
          <p className="mt-4 text-sm sm:text-base text-slate-600">
            {t('how.subtitle', 'From media to insight — fast, secure, and reliable.')}
          </p>
        </div>

        <div className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 sm:gap-6 sm:pb-8 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:pb-0">
          {steps.map(({ key, icon: Icon, annotation, glideKey }, index) => (
            <article
              key={key}
              className="group relative min-w-[240px] snap-start overflow-hidden rounded-3xl border border-indigo-100 bg-white/80 px-6 py-8 shadow-lg shadow-indigo-100/40 backdrop-blur transition hover:-translate-y-2 hover:shadow-2xl lg:min-w-0"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white via-indigo-50/70 to-white" aria-hidden="true" />
              <div className="absolute -left-6 top-10 h-20 w-20 rounded-full bg-indigo-200/40 blur-3xl" aria-hidden="true" />
              <div className="relative flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-400 text-white shadow-lg shadow-indigo-400/40">
                    <Icon fontSize="small" />
                  </span>
                  <span className="rounded-full border border-indigo-200/60 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-500">
                    {t('how.step', 'Step')} {index + 1}
                  </span>
                </div>
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-slate-900">{t(`${glideKey}.title`)}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{t(`${glideKey}.desc`)}</p>
                  <div className="rounded-2xl bg-slate-900/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-100 shadow">
                    {annotation}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
