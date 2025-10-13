import React from 'react';
import { useTranslation } from 'react-i18next';

import { SectionContainer, SectionHeader, SectionGrid } from './components/sectionPrimitives';

export default function SupportedInputs() {
  const { t } = useTranslation('home');
  const badges = [
    t('supported.badges.photo', 'JPG · PNG photos'),
    t('supported.badges.video', 'MP4 clips'),
    t('supported.badges.photoLimit', 'Photos up to 20MB'),
    t('supported.badges.videoLimit', 'Videos up to 2 min / 200MB'),
  ];

  return (
    <SectionContainer
      id="supported"
      variant="inverted"
      width="medium"
    >
      <SectionHeader
        eyebrow={t('supported.eyebrow', 'What you can upload')}
        title={t('supported.title', 'Supported formats & sizes')}
        description={t('supported.subtitle', 'Just the basics you need before uploading photos or videos.')}
        theme="dark"
        eyebrowClassName="text-indigo-200"
        titleClassName="text-xl sm:text-3xl md:text-4xl"
      />

      <ul className="mx-auto mt-10 flex flex-wrap justify-center gap-2" role="list">
        {badges.map((label) => (
          <li
            key={label}
            className="rounded-full bg-indigo-500/20 px-4 py-1.5 text-xs font-semibold text-indigo-100"
          >
            {label}
          </li>
        ))}
      </ul>

      <SectionGrid className="mx-auto max-w-4xl sm:grid-cols-2">
        <article className="rounded-3xl border border-indigo-400/30 bg-white/5 p-6 shadow-lg shadow-black/30 backdrop-blur">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-indigo-200">
            {t('supported.cards.image.title', 'Quick check for single photos')}
          </h4>
          <p className="mt-3 text-xs text-indigo-100/80">
            {t(
              'supported.cards.image.subtitle',
              'See capture traces and manipulation hints for important profile or family photos.'
            )}
          </p>
          <p className="mt-5 rounded-2xl bg-indigo-500/10 px-4 py-3 text-xs font-semibold text-indigo-100">
            {t('supported.cards.image.example', 'Supports JPG/PNG up to 20MB each')}
          </p>
        </article>

        <article className="rounded-3xl border border-indigo-400/30 bg-white/5 p-6 shadow-lg shadow-black/30 backdrop-blur">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-indigo-200">
            {t('supported.cards.video.title', 'Review short video clips')}
          </h4>
          <p className="mt-3 text-xs text-indigo-100/80">
            {t(
              'supported.cards.video.subtitle',
              'Upload short marketplace or intro clips and we focus on the key frames for you.'
            )}
          </p>
          <p className="mt-5 rounded-2xl bg-indigo-500/10 px-4 py-3 text-xs font-semibold text-indigo-100">
            {t('supported.cards.video.example', 'MP4 up to 2 minutes / 200MB')}
          </p>
        </article>
      </SectionGrid>
    </SectionContainer>
  );
}
