import React from 'react';
import { useTranslation } from 'react-i18next';
import { integrations } from '../data';

const IntegrationShowcase = () => {
  const { t } = useTranslation('feature');

  return (
    <section className="relative max-w-6xl mx-auto px-6 py-16">
      <div className="mx-auto max-w-3xl text-center space-y-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          {t('integrations.title', 'Connect the stack you already trust')}
        </h2>
        <p className="text-sm sm:text-base text-slate-600">
          {t(
            'integrations.subtitle',
            'Out-of-the-box integrations and webhooks help you push verdicts, escalate alerts, and sync evidence in minutes.'
          )}
        </p>
      </div>

      <div className="mt-10 grid gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl sm:grid-cols-2 lg:grid-cols-4">
        {integrations.map((name) => (
          <div
            key={name}
            className="flex items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-6 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            {name}
          </div>
        ))}
      </div>
    </section>
  );
};

export default IntegrationShowcase;
