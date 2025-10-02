import { AutoAwesome, LockPerson, Hub } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const items = [
  {
    key: 'composer',
    titleKey: 'feature.items.oneLine.name',
    descKey: 'feature.items.oneLine.desc',
    highlightKey: 'feature.items.oneLine.highlight',
    icon: AutoAwesome,
  },
  {
    key: 'security',
    titleKey: 'feature.items.security.name',
    descKey: 'feature.items.security.desc',
    highlightKey: 'feature.items.security.highlight',
    icon: LockPerson,
  },
  {
    key: 'hub',
    titleKey: 'feature.items.scaling.name',
    descKey: 'feature.items.scaling.desc',
    highlightKey: 'feature.items.scaling.highlight',
    icon: Hub,
  },
];

export default function Feature() {
  const { t } = useTranslation('home');

  return (
    <section id="feature" className="relative isolate overflow-hidden py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.16),_transparent_60%)]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500 ring-1 ring-indigo-100">
            {t('feature.eyebrow', 'Integrate Instantly')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight text-slate-900">
            {t('feature.title', 'Plug and Play')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {t('feature.subtitle', 'Vision, language, and custom models ready out-of-the-box')}
            <br />
            {t('feature.subtitle2', 'Focus on building; we handle the heavy lifting.')}
          </p>

          <div className="grid gap-4">
            {items.map(({ key, titleKey, descKey, highlightKey, icon: Icon }) => (
              <article
                key={key}
                className="group relative overflow-hidden rounded-3xl border border-white/40 bg-white/80 px-5 py-4 shadow-[0_16px_30px_-20px_rgba(79,70,229,0.4)] backdrop-blur transition hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white via-indigo-50/70 to-white" aria-hidden="true" />
                <div className="relative flex gap-4">
                  <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-400 text-white shadow-lg shadow-indigo-500/40">
                    <Icon fontSize="small" />
                  </span>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-base font-semibold text-slate-900">{t(titleKey)}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{t(descKey)}</p>
                    <div className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                      {t(highlightKey)}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white/80 shadow-2xl shadow-indigo-200/50">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-indigo-400/10 to-white" aria-hidden="true" />
          <div className="relative flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-indigo-500">
              <span>{t('feature.mock.session', 'Integration session')}</span>
              <span>{t('feature.mock.timestamp', 'Live')}</span>
            </div>
            <pre className="overflow-auto rounded-2xl bg-slate-900/95 p-6 text-xs leading-6 text-emerald-200 shadow-inner shadow-black/40">
{`curl --request POST \
  https://api.gravifox.com/v1/analyze \
  --header "Authorization: Bearer $GF_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "media": "https://cdn.example.com/sample.mp4",
    "callbacks": {
      "success": "https://hooks.example.com/success",
      "failure": "https://hooks.example.com/failure"
    }
  }'`}
            </pre>
            <div className="rounded-2xl border border-white/60 bg-white/80 p-4 text-xs text-slate-600 shadow-md">
              <div className="font-semibold text-slate-900">{t('feature.mock.resultTitle', 'Instant verdict')}</div>
              <p>{t('feature.mock.resultDesc', 'Risk score: 0.82 · Playback paused · webhook dispatched')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
