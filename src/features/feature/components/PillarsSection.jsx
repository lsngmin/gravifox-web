import React from 'react';
import { useTranslation } from 'react-i18next';
import { AutoAwesome, Security, RocketLaunch } from '@mui/icons-material';
import { pillars } from '../data';

const icons = {
  resilience: Security,
  fidelity: AutoAwesome,
  velocity: RocketLaunch
};

const PillarsSection = () => {
  const { t } = useTranslation('feature');

  return (
    <section className="relative max-w-6xl mx-auto px-6 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          {t('pillars.title', 'Designed to keep trust & safety a step ahead')}
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600">
          {t(
            'pillars.subtitle',
            'Platform primitives engineered for resilience, auditability, and lightning-fast response.'
          )}
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {pillars.map((pillar) => {
          const Icon = icons[pillar.id] ?? AutoAwesome;
          return (
            <article
              key={pillar.id}
              className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-100/40 transition hover:-translate-y-1.5 hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(226,232,240,0.45),_transparent_70%)]" aria-hidden="true" />
              <div className="relative space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100/70 text-indigo-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{t(`pillars.items.${pillar.id}.title`, pillar.title)}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t(`pillars.items.${pillar.id}.description`, pillar.description)}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default PillarsSection;
