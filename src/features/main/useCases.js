import React from 'react';
import { useTranslation } from 'react-i18next';
import { PhotoIcon, BriefcaseIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function UseCases() {
  const { t } = useTranslation('home');
  const cases = [
    {
      icon: PhotoIcon,
      title: t('useCases.items.secondHand.title', 'Check second-hand listing photos'),
      desc: t(
        'useCases.items.secondHand.desc',
        'Verify the photos in a marketplace listing before you meet the seller.'
      ),
      detail: t(
        'useCases.items.secondHand.detail',
        'Highlights suspicious areas and gives you a shareable link.'
      ),
    },
    {
      icon: BriefcaseIcon,
      title: t('useCases.items.jobProfile.title', 'Verify hiring profile media'),
      desc: t(
        'useCases.items.jobProfile.desc',
        'Quickly check if a candidate’s profile or portfolio images were AI generated.'
      ),
      detail: t('useCases.items.jobProfile.detail', 'Share the verdict instantly without downloading files.'),
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: t('useCases.items.community.title', 'Review community reports'),
      desc: t(
        'useCases.items.community.desc',
        'Upload suspicious media from social feeds or forums to see if it is real.'
      ),
      detail: t('useCases.items.community.detail', 'Save summary notes and evidence captures for reports.'),
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
          {cases.map(({ icon: Icon, title, desc, detail }) => (
            <article
              key={title}
              className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative flex h-full flex-col">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/90 text-white shadow-lg shadow-indigo-500/30">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h4 className="mt-6 text-lg font-semibold text-slate-900">{title}</h4>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{desc}</p>
                <p className="mt-6 rounded-2xl bg-indigo-50 px-4 py-3 text-xs font-medium text-indigo-700">
                  {detail}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
