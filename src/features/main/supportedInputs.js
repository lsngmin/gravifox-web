import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SupportedInputs() {
  const { t } = useTranslation('home');
  const badges = [
    t('supported.badges.photo', 'JPG · PNG photos'),
    t('supported.badges.video', 'MP4 clips'),
    t('supported.badges.photoLimit', 'Photos up to 20MB'),
    t('supported.badges.videoLimit', 'Videos up to 2 min / 200MB'),
  ];

  return (
    <section id="supported" className="relative isolate overflow-hidden py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.35),_transparent_65%)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-6 text-slate-100">
        <div className="mx-auto max-w-3xl text-center">
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300">
            {t('supported.eyebrow', 'What you can upload')}
          </h3>
          <p className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {t('supported.title', 'Supported formats & sizes')}
          </p>
          <p className="mt-4 text-sm sm:text-base text-indigo-100/90">
            {t('supported.subtitle', 'Just the basics you need before uploading photos or videos.')}
          </p>
        </div>

        <div className="mx-auto mt-10 flex flex-wrap justify-center gap-2">
          {badges.map((label) => (
            <span key={label} className="rounded-full bg-indigo-500/20 px-4 py-1.5 text-xs font-semibold text-indigo-100">
              {label}
            </span>
          ))}
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
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
        </div>
      </div>
    </section>
  );
}
