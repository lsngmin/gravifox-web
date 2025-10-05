import { useTranslation } from 'react-i18next';

export default function SampleOutput() {
  const { t } = useTranslation('home');
  const insightItems = t('sample.insights.items', { returnObjects: true }) || [];

  return (
    <section id="sample" className="relative isolate overflow-hidden bg-transparent py-12 sm:py-16 scroll-mt-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            {t('sample.eyebrow', 'Sample result')}
          </h3>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            {t('sample.title', 'Take a peek at the real verdict screen')}
          </p>
          <p className="mt-4 text-gray-600">
            {t('sample.subtitle', 'We captured a quick example so you know exactly what shows up after analysis.')}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-slate-900 via-indigo-900/70 to-slate-900 text-slate-100 shadow-2xl shadow-indigo-200/40">
            <div className="absolute inset-x-8 inset-y-6 rounded-[36px] border border-white/10" aria-hidden="true" />
            <div className="relative flex h-full flex-col justify-between gap-6 rounded-[30px] bg-white/5 p-6 sm:p-8">
              <div className="inline-flex items-center gap-2 self-start rounded-full bg-indigo-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-100 ring-1 ring-indigo-400/50">
                {t('sample.result.badge', 'AI verdict')}
              </div>
              <div className="space-y-3">
                <h4 className="text-2xl font-semibold text-white sm:text-3xl">
                  {t('sample.result.headline', 'This photo is likely real')}
                </h4>
                <div className="text-sm font-medium text-emerald-200">
                  {t('sample.result.confidence', 'Confidence 87%')}
                </div>
                <p className="text-sm leading-relaxed text-slate-200">
                  {t('sample.result.description', 'Lighting and texture patterns matched authentic captures.')}
                </p>
              </div>
              <div className="rounded-2xl bg-white/15 px-4 py-3 text-center text-sm font-semibold text-white shadow-inner shadow-black/20">
                {t('sample.result.cta', 'Copy link to share')}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-indigo-50">
            <div>
              <h4 className="text-lg font-semibold text-slate-900">
                {t('sample.insights.title', 'What the result highlights')}
              </h4>
            </div>
            <ul className="space-y-3">
              {insightItems.map((item, index) => (
                <li key={index} className="flex gap-3 text-left">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-indigo-500" aria-hidden="true" />
                  <span className="text-sm leading-relaxed text-slate-600">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-400">{t('sample.insights.footnote')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
