import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowPathIcon, EyeSlashIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function SecurityPrivacy() {
  const { t } = useTranslation('home');
  const itemDefaults = [
    {
      title: 'Automatic deletion',
      desc: 'We remove your original file right after showing the results.',
    },
    {
      title: 'No public sharing',
      desc: 'Only you can access the report unless you decide to share it.',
    },
    {
      title: 'Encrypted uploads',
      desc: 'Every upload travels through an encrypted connection.',
    },
  ];

  const translatedItems = t('security.items', {
    returnObjects: true,
    defaultValue: itemDefaults,
  });

  const icons = [ArrowPathIcon, EyeSlashIcon, LockClosedIcon];

  const normalizedItems = Array.isArray(translatedItems)
    ? translatedItems
    : Object.values(translatedItems);

  const items = normalizedItems.map((item, index) => {
    const fallback = itemDefaults[index] || itemDefaults[itemDefaults.length - 1];
    return {
      ...fallback,
      ...item,
      icon: icons[index % icons.length],
    };
  });

  return (
    <section id="security" className="relative isolate overflow-hidden py-16 sm:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_65%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="flex flex-col justify-center space-y-5 sm:space-y-6">
            <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-emerald-500">
              {t('security.eyebrow', '데이터 처리 방식')}
            </h3>

            <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-snug sm:leading-tight">
              {t('security.title', '올린 파일은 분석 외 용도로 사용되지 않아요')}
            </p>

            <p className="text-[13px] sm:text-sm md:text-base lg:text-lg text-slate-600 leading-relaxed sm:leading-normal md:leading-snug max-w-xl">
              {t('security.subtitle', '원하지 않으면 학습에도 사용되지 않으며, 모든 파일은 암호화 후 안전하게 삭제됩니다.')}
            </p>

            <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-emerald-200/70 bg-white/80 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-emerald-600 shadow-md shadow-emerald-100/50">
              <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
              {t('security.callout', '모든 업로드 파일은 분석 후 자동 삭제됩니다')}
            </div>
          </div>


          <div className="grid gap-5 sm:grid-cols-2">
            {items.map(({ icon: Icon, title, desc }, index) => (
              <article
                key={`${title}-${index}`}
                className="relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-emerald-100/80 bg-white/80 p-6 shadow-lg shadow-emerald-100/40 backdrop-blur transition hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/70 to-white" aria-hidden="true" />
                <div className="relative flex flex-col gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-400 text-white shadow-lg shadow-emerald-400/40">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
