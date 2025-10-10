import { useTranslation } from 'react-i18next';

import { SectionContainer, SectionHeader } from './components/sectionPrimitives';

const steps = [
  {
    key: 'signup',
    number: '1',
    titleKey: 'feature.steps.signup.title',
    descKey: 'feature.steps.signup.desc',
  },
  {
    key: 'upload',
    number: '2',
    titleKey: 'feature.steps.upload.title',
    descKey: 'feature.steps.upload.desc',
  },
  {
    key: 'review',
    number: '3',
    titleKey: 'feature.steps.review.title',
    descKey: 'feature.steps.review.desc',
  },
];

export default function Feature() {
  const { t } = useTranslation('home');

  return (
    <SectionContainer
      id="feature"
      width="medium"
      className="before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.16),_transparent_60%)] before:opacity-90 before:content-['']"
    >
      <div className="relative grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="space-y-6">
          <SectionHeader
            eyebrow={t('feature.eyebrow', '직접 체험하기')}
            title={t('feature.title', '사진이나 영상을 올리면, AI가 분석해요')}
            description={t('feature.subtitle', '회원가입부터 결과 공유까지, 세 단계면 충분합니다.')}
            align="left"
            eyebrowClassName="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[10px] sm:text-xs md:text-sm font-semibold tracking-[0.25em] text-indigo-500 ring-1 ring-indigo-100"
            titleClassName="text-2xl sm:text-3xl md:text-4xl lg:text-5xl lg:leading-tight"
            descriptionClassName="max-w-xl text-[12px] sm:text-sm md:text-base lg:text-lg"
          />
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white/80 shadow-2xl shadow-indigo-200/50">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-indigo-400/10 to-white" aria-hidden="true" />
          <div className="relative flex flex-col gap-6 p-6">
            <div className="relative overflow-hidden rounded-2xl bg-slate-900/95 p-5 text-slate-100 shadow-inner shadow-black/30">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-indigo-200">
                {t('feature.demo.label', 'Demo preview')}
              </div>
              <div className="mt-4 text-lg font-semibold text-white">{t('feature.demo.status', 'AI is analyzing…')}</div>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                {t('feature.demo.caption', 'Once upload finishes, the result card fills in automatically.')}
              </p>
              <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4 text-left text-xs text-slate-200">
                <div className="text-sm font-semibold text-white">{t('feature.demo.preview.title', 'Verdict summary')}</div>
                <p className="mt-1 leading-relaxed">
                  {t('feature.demo.preview.desc', 'This image looks authentic. Evidence and sharing controls appear alongside.')}
                </p>
              </div>
            </div>
            <ol className="space-y-4">
              {steps.map(({ key, number, titleKey, descKey }) => (
                <li
                  key={key}
                  className="flex gap-4 rounded-2xl border border-white/60 bg-white/80 p-4 text-left shadow-[0_18px_40px_-28px_rgba(79,70,229,0.65)] backdrop-blur"
                >
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500 text-base font-semibold text-white shadow-lg shadow-indigo-400/50">
                    {number}
                  </span>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-slate-900">{t(titleKey)}</div>
                    <p className="text-sm leading-relaxed text-slate-600">{t(descKey)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
