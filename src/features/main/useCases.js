import React from 'react';
import { useTranslation } from 'react-i18next';
import { VideoCameraIcon, ShieldCheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default function UseCases() {
  const { t } = useTranslation('home');
  const cases = [
    {
      icon: VideoCameraIcon,
      title: t('useCases.items.mediaModeration.title', 'Media moderation'),
      desc: t('useCases.items.mediaModeration.desc', 'Screen user uploads for deepfakes and manipulated content.'),
      detail: t('useCases.items.mediaModeration.detail', 'Live verdict streaming for UGC flows'),
    },
    {
      icon: ShieldCheckIcon,
      title: t('useCases.items.brandSafety.title', 'Brand safety'),
      desc: t('useCases.items.brandSafety.desc', 'Protect campaigns and assets from deceptive media risks.'),
      detail: t('useCases.items.brandSafety.detail', 'Evidence packs for legal & policy teams'),
    },
    {
      icon: GlobeAltIcon,
      title: t('useCases.items.platformIntegrity.title', 'Platform integrity'),
      desc: t('useCases.items.platformIntegrity.desc', 'Flag suspicious accounts and content at scale.'),
      detail: t('useCases.items.platformIntegrity.detail', 'Risk-based throttling and step-up checks'),
    },
  ];

  return (
    <section id="use-cases" className="relative isolate overflow-hidden bg-transparent py-12 sm:py-16 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            {t('useCases.eyebrow', 'Use Cases')}
          </h3>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            {t('useCases.title', 'Where Gravifox fits')}
          </p>
          <p className="mt-4 text-gray-600">
            {t('useCases.subtitle', 'Practical scenarios where detection adds value.')}
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {cases.map(({ icon: Icon, title, desc, detail }, index) => (
            <article
              key={title}
              className="relative overflow-hidden rounded-3xl border border-indigo-100/60 bg-white/80 p-6 shadow-lg shadow-indigo-100/40 transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white via-indigo-50/70 to-slate-100" aria-hidden="true" />
              <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-indigo-200/40 blur-3xl" aria-hidden="true" />
              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/90 text-white shadow-lg shadow-indigo-500/30">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="rounded-full border border-indigo-200/70 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-500">
                    {`0${index + 1}`}
                  </span>
                </div>
                <h4 className="mt-6 text-lg font-semibold text-slate-900">{title}</h4>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{desc}</p>
                <div className="mt-6 rounded-2xl bg-slate-900/90 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-indigo-100 shadow">
                  {detail}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
