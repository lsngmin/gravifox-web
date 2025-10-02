import React from 'react';
import { useTranslation } from 'react-i18next';
import { workflow } from '../data';

const WorkflowSection = () => {
  const { t } = useTranslation('feature');

  return (
    <section className="relative overflow-hidden bg-slate-900 text-slate-100 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.2),_transparent_65%)]" aria-hidden="true" />
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="flex flex-col gap-4 text-center sm:text-left sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
              {t('workflow.title', 'A deploy-ready response loop')}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl">
              {t(
                'workflow.subtitle',
                'From ingestion to action, each stage is orchestrated to keep investigators focused on decisions—not tooling.'
              )}
            </p>
          </div>
          <a
            href="/en/docs"
            className="inline-flex items-center justify-center rounded-full border border-indigo-300/80 bg-transparent px-5 py-2 text-xs font-semibold uppercase tracking-wider text-indigo-100 transition hover:bg-indigo-500/20"
          >
            {t('workflow.cta', 'See end-to-end reference flow')}
          </a>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {workflow.map(({ title, caption }) => (
            <article
              key={title}
              className="relative flex h-full flex-col justify-between rounded-3xl border border-indigo-500/40 bg-slate-900/70 p-6 shadow-xl shadow-indigo-900/40 backdrop-blur"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">{title}</p>
                <p className="mt-4 text-sm text-slate-200 leading-relaxed">{caption}</p>
              </div>
              <div className="mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-indigo-400 to-emerald-300" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
