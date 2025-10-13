import React from 'react';
import { useTranslation } from 'react-i18next';
import { Disclosure } from '@headlessui/react';
import { Add as PlusIcon, Remove as MinusIcon } from '@mui/icons-material';

import { SectionContainer, SectionHeader } from './components/sectionPrimitives';

export default function FAQ() {
  const { t } = useTranslation('home');
  const items = t('faq.items', {
    returnObjects: true,
    defaultValue: [
      { q: 'How accurate is detection?', a: 'We tune on real-world datasets and continuously improve.' },
      { q: 'How fast is the API?', a: 'Most responses arrive within a few seconds.' },
      { q: 'What formats do you support?', a: 'Common video and image formats including MP4, MOV, JPG, and PNG.' },
      { q: 'Is there a free trial?', a: 'Yes. Start free and upgrade as you grow.' },
    ],
  });

  return (
    <SectionContainer
      id="faq"
      width="narrow"
      className="before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),_transparent_65%)] before:content-['']"
    >
      <SectionHeader
        eyebrow={t('faq.eyebrow', '자주 묻는 질문')}
        title={t('faq.title', '자주 묻는 질문에 대한 답변')}
      />

      <div className="mt-12 grid gap-4">
        {items.map((item, idx) => (
          <Disclosure key={idx}>
            {({ open }) => (
              <article className="relative overflow-hidden rounded-3xl border border-indigo-100/70 bg-white/85 px-5 py-4 shadow-lg shadow-indigo-100/40 backdrop-blur transition hover:-translate-y-1.5 hover:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-white via-indigo-50/70 to-white" aria-hidden="true" />
                <div className="relative">
                  <Disclosure.Button className="flex w-full items-center justify-between gap-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold uppercase tracking-wide text-indigo-500">
                        {t('faq.stepLabel', 'Topic')} {idx + 1}
                      </span>
                      <span className="text-base sm:text-lg font-semibold text-slate-900">{item.q}</span>
                    </div>
                    <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-indigo-200/60 bg-white/80 text-indigo-500 shadow-sm">
                      {open ? <MinusIcon fontSize="small" /> : <PlusIcon fontSize="small" />}
                    </span>
                  </Disclosure.Button>
                  <Disclosure.Panel className="mt-4 rounded-2xl border border-indigo-100/60 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-inner shadow-indigo-200/40">
                    {item.a}
                  </Disclosure.Panel>
                </div>
              </article>
            )}
          </Disclosure>
        ))}
      </div>
    </SectionContainer>
  );
}
