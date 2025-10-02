import React from 'react';
import { metrics } from '../data';

const MetricsHighlights = () => (
  <section className="relative max-w-6xl mx-auto px-6 py-12">
    <div className="grid gap-6 md:grid-cols-3">
      {metrics.map(({ label, value, description }) => (
        <article
          key={label}
          className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 p-6 shadow-md shadow-indigo-200/30 transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(165,180,252,0.22),_transparent_70%)]" aria-hidden="true" />
          <div className="relative space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">{label}</p>
            <p className="text-4xl font-extrabold text-slate-900">{value}</p>
            <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
          </div>
        </article>
      ))}
    </div>
  </section>
);

export default MetricsHighlights;
