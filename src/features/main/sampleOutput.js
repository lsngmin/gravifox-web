import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      className="rounded-md bg-slate-700/60 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700 ring-1 ring-white/10"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function SampleOutput() {
  const { t } = useTranslation('home');
  const [lang, setLang] = useState('python');

  const code = useMemo(() => {
    const url = 'https://gravifox.com/api/analyze';
    if (lang === 'curl') {
      return `curl -X POST \\\n+  ${url} \\\n+  -H 'Content-Type: application/json' \\\n+  -d '{"imageUrl":"https://gravifox.com/sample.jpg"}'`;
    }
    if (lang === 'js') {
      return `const res = await fetch('${url}', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ imageUrl: 'https://gravifox.com/sample.jpg' })\n});\nconst data = await res.json();\nconsole.log(data);`;
    }
    return `import requests\n\nres = requests.post(\n    '${url}',\n    json={ 'imageUrl': 'https://gravifox.com/sample.jpg' }\n)\nprint(res.json())`;
  }, [lang]);

  const response = `{
  "score": 0.92,
  "label": "likely_deepfake",
  "explanations": [
    { "frame": 12, "weight": 0.41 },
    { "frame": 27, "weight": 0.33 }
  ]
}`;

  return (
    <section id="sample" className="relative isolate overflow-hidden bg-transparent py-12 sm:py-16 scroll-mt-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            {t('sample.eyebrow', 'Sample Output')}
          </h3>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            {t('sample.title', 'See results before you build')}
          </p>
          <p className="mt-4 text-gray-600">
            {t('sample.subtitle', 'Minimal request. Clear response. Copy and try now.')}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:mt-10 md:grid-cols-2">
          {/* Request */}
          <div className="relative rounded-xl bg-slate-900 text-slate-50 shadow-lg ring-1 ring-black/5">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
              <div className="inline-flex items-center gap-1 rounded-full bg-slate-800 p-1 text-xs">
                {['curl','js','python'].map(k => (
                  <button
                    key={k}
                    onClick={() => setLang(k)}
                    className={`px-3 py-1 rounded-full transition ${lang===k ? 'bg-indigo-500 text-white' : 'text-slate-300 hover:text-white'}`}
                  >
                    {k.toUpperCase()}
                  </button>
                ))}
              </div>
              <CopyButton text={code} />
            </div>
            <pre className="overflow-auto p-4 text-sm leading-6">
{code}
            </pre>
          </div>

          {/* Response */}
          <div className="rounded-xl border border-slate-200 bg-white p-0 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('sample.response', 'Response')}</span>
              <CopyButton text={response} />
            </div>
            <pre className="overflow-auto p-4 text-sm text-slate-800">
{response}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
