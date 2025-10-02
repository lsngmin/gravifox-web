import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowOutward } from '@mui/icons-material';

const CtaBanner = () => {
  const { t } = useTranslation('feature');

  return (
    <section className="relative overflow-hidden py-16">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-500 via-slate-900 to-indigo-700" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(129,140,248,0.35),_transparent_65%)]" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-5xl flex-col gap-6 px-6 text-center text-indigo-50 sm:text-left sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
            {t('cta.title', 'Ready to orchestrate GenAI image response like a product team?')}
          </h2>
          <p className="text-sm sm:text-base text-indigo-100/90">
            {t(
              'cta.subtitle',
              'Spin up a pilot workspace, sync your moderation stack, and experience how fast incident response can move when AI and humans collaborate.'
            )}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="/en/free-trial"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-black/20 transition hover:bg-indigo-50"
          >
            {t('cta.primary', 'Launch guided pilot')}
            <ArrowOutward className="ml-2 h-5 w-5" />
          </a>
          <a
            href="mailto:sales@gravifox.com"
            className="inline-flex items-center justify-center rounded-full border border-indigo-100/70 bg-transparent px-6 py-3 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-500/20"
          >
            {t('cta.secondary', 'Talk to our team')}
          </a>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
