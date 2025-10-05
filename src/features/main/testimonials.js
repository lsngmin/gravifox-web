import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormatQuote } from '@mui/icons-material';

export default function Testimonials() {
  const { t } = useTranslation('home');
  const items = t('socialProof.items', {
    returnObjects: true,
    defaultValue: [
      {
        quote: 'It told me right away whether our family photos were authentic, so I could tidy the album with peace of mind.',
        author: 'Tester A',
        descriptor: 'Digitising family albums',
      },
      {
        quote: 'Checking listings before I pay keeps me from getting scammed on second-hand deals.',
        author: 'Buyer B',
        descriptor: 'Active marketplace user',
      },
      {
        quote: 'I can verify videos before sharing them with my community, which keeps rumours from spreading.',
        author: 'Community C',
        descriptor: 'Online forum moderator',
      },
    ],
  });

  return (
    <section id="testimonials" className="relative isolate overflow-hidden py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(129,140,248,0.25),_transparent_60%)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-6 text-indigo-50">
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200">
            {t('socialProof.eyebrow', 'User stories')}
          </h3>
          <p className="text-3xl sm:text-4xl font-bold leading-tight text-white">
            {t('socialProof.title', 'Honest words from real people')}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, idx) => (
            <figure
              key={idx}
              className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 shadow-[0_24px_40px_-28px_rgba(15,23,42,0.8)] backdrop-blur transition hover:-translate-y-2 hover:shadow-[0_30px_60px_-30px_rgba(129,140,248,0.8)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-indigo-500/10 to-white/5" aria-hidden="true" />
              <FormatQuote className="relative h-6 w-6 text-indigo-200" aria-hidden="true" />
              <blockquote className="relative mt-4 text-sm sm:text-base leading-relaxed text-indigo-50/90">
                “{it.quote}”
              </blockquote>
              <figcaption className="relative mt-6 flex flex-col gap-1">
                <span className="text-sm font-semibold text-white">{it.author}</span>
                {(it.descriptor || it.company) && (
                  <span className="text-xs font-medium text-indigo-200/80">{it.descriptor || it.company}</span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
