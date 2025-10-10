import React from 'react';
import { useTranslation } from 'react-i18next';
import { PhotoIcon, BriefcaseIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

import { SectionContainer, SectionHeader, SectionGrid } from './components/sectionPrimitives';

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
      title: t('useCases.items.socialMedia.title', 'Review socialMedia reports'),
      desc: t(
        'useCases.items.socialMedia.desc',
        'Upload suspicious media from social feeds or forums to see if it is real.'
      ),
      detail: t('useCases.items.socialMedia.detail', 'Save summary notes and evidence captures for reports.'),
    },
  ];

  return (
    <SectionContainer
      id="use-cases"
      width="default"
      padded
      className="scroll-mt-24"
    >
      <SectionHeader
        eyebrow={t('useCases.eyebrow', 'Use Cases')}
        title={t('useCases.title', 'Where Gravifox fits')}
        description={t('useCases.subtitle', '다른 일을 하러 가도 분석은 백그라운드에서 계속돼요.')}
      />

      <SectionGrid className="lg:grid-cols-3" role="list">
        {cases.map(({ icon: Icon, title, desc, detail }) => (
          <article
            key={title}
            role="listitem"
            tabIndex={0}
            className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <div className="relative flex h-full flex-col">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/90 text-white shadow-lg shadow-indigo-500/30">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h4 className="mt-6 text-lg font-semibold text-slate-900">{title}</h4>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{desc}</p>
              <p className="mt-6 rounded-2xl bg-indigo-50 px-4 py-3 text-xs font-medium text-indigo-700">
                {detail}
              </p>
            </div>
          </article>
        ))}
      </SectionGrid>
    </SectionContainer>
  );
}
