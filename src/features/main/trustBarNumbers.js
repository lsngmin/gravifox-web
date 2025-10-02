import React from 'react';
import { useTranslation } from 'react-i18next';

export default function TrustBarNumbers() {
  const { t } = useTranslation('home');

  const items = [
    { value: t('trust.numbers.items.uptime.value', '99.9%'), label: t('trust.numbers.items.uptime.label', 'API uptime') },
    { value: t('trust.numbers.items.requests.value', '50K+'), label: t('trust.numbers.items.requests.label', 'Monthly analyses') },
    { value: t('trust.numbers.items.customers.value', '120+'), label: t('trust.numbers.items.customers.label', 'Active customers') },
    { value: t('trust.numbers.items.regions.value', '3'), label: t('trust.numbers.items.regions.label', 'Global regions') },
  ];

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <h3 className="text-center text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t('trust.numbers.title', 'Trusted performance at scale')}
          </h3>
          <dl className="mt-6 grid grid-cols-2 gap-6 sm:mt-8 sm:grid-cols-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center rounded-xl border border-slate-200 px-4 py-5 bg-white">
                <dt className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{item.value}</dt>
                <dd className="mt-1 text-sm text-slate-600 text-center">{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

