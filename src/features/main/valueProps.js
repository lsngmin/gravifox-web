import React from 'react';
import { useTranslation } from 'react-i18next';
import { BoltIcon, PuzzlePieceIcon, ShieldCheckIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function ValueProps() {
  const { t } = useTranslation('home');
  const items = [
    {
      icon: BoltIcon,
      title: t('value.items.speed.title', 'Fast results'),
      desc: t('value.items.speed.desc', 'See insights in seconds, not minutes.'),
      stat: t('value.items.speed.stat', '~3.8s median turnaround'),
    },
    {
      icon: PuzzlePieceIcon,
      title: t('value.items.integration.title', 'Easy integration'),
      desc: t('value.items.integration.desc', 'One-line API or lightweight SDK.'),
      stat: t('value.items.integration.stat', 'Ship in a sprint, not a quarter'),
    },
    {
      icon: ShieldCheckIcon,
      title: t('value.items.accuracy.title', 'Reliable detection'),
      desc: t('value.items.accuracy.desc', 'Models tuned for real-world signals.'),
      stat: t('value.items.accuracy.stat', 'Certified by leading trust teams'),
    },
    {
      icon: CurrencyDollarIcon,
      title: t('value.items.cost.title', 'Cost-effective'),
      desc: t('value.items.cost.desc', 'Fair, transparent pricing as you scale.'),
      stat: t('value.items.cost.stat', 'Only pay for verdicts you use'),
    },
  ];

  return (
    <section id="value" className="relative isolate overflow-hidden py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),_transparent_60%)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
            {t('value.eyebrow', 'Why Gravifox')}
          </h3>
          <p className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            {t('value.title', 'Balanced accuracy, speed, and simplicity')}
          </p>
          <p className="mt-4 text-sm sm:text-base text-slate-600">
            {t('value.subtitle', 'Designed for quick adoption and dependable results.')}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, desc, stat }, idx) => (
            <article
              key={idx}
              className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 px-6 py-7 shadow-[0_20px_40px_-24px_rgba(79,70,229,0.45)] backdrop-blur transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_26px_60px_-30px_rgba(15,23,42,0.45)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/60 via-white/80 to-indigo-50/40" aria-hidden="true" />
              <div className="absolute right-4 top-4 h-24 w-24 rounded-full bg-indigo-200/40 blur-3xl" aria-hidden="true" />
              <div className="relative flex flex-col gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/90 to-indigo-400 text-white shadow-lg shadow-indigo-500/40">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{desc}</p>
                </div>
                <div className="mt-4 rounded-2xl border border-indigo-200/70 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-500">
                  {stat}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
