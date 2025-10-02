import React from 'react';
import { useTranslation } from 'react-i18next';
import { LockClosedIcon, ShieldCheckIcon, KeyIcon, ServerStackIcon } from '@heroicons/react/24/outline';

export default function SecurityPrivacy() {
  const { t } = useTranslation('home');
  const items = [
    {
      icon: LockClosedIcon,
      title: t('security.items.encryption.title', 'Encryption in transit'),
      desc: t('security.items.encryption.desc', 'TLS 1.2+ for all requests.'),
      badge: t('security.items.encryption.badge', 'AES-256 + PFS'),
    },
    {
      icon: ShieldCheckIcon,
      title: t('security.items.access.title', 'Access controls'),
      desc: t('security.items.access.desc', 'Scoped keys and role-based access.'),
      badge: t('security.items.access.badge', 'SOC 2 aligned'),
    },
    {
      icon: KeyIcon,
      title: t('security.items.retention.title', 'Data retention'),
      desc: t('security.items.retention.desc', 'Configurable retention and deletion policies.'),
      badge: t('security.items.retention.badge', 'Custom policies'),
    },
    {
      icon: ServerStackIcon,
      title: t('security.items.region.title', 'Regional hosting'),
      desc: t('security.items.region.desc', 'Choose regions to meet compliance.'),
      badge: t('security.items.region.badge', 'US / EU / APAC'),
    },
  ];

  return (
    <section id="security" className="relative isolate overflow-hidden py-16 sm:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_65%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-center space-y-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-500">
              {t('security.eyebrow', 'Security & Privacy')}
            </h3>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              {t('security.title', 'Enterprise-minded by default')}
            </p>
            <p className="text-sm sm:text-base text-slate-600">
              {t('security.subtitle', 'We keep your data protected with clear, predictable controls.')}
            </p>
            <div className="rounded-2xl border border-emerald-200/60 bg-white/70 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-emerald-600 shadow-lg shadow-emerald-100/40">
              {t('security.callout', 'Zero data retention by default · SOC 2 Type II in progress')}
            </div>
          </div>

          <div className="grid gap-4">
            {items.map(({ icon: Icon, title, desc, badge }) => (
              <article
                key={title}
                className="relative overflow-hidden rounded-3xl border border-emerald-100/70 bg-white/80 p-6 shadow-lg shadow-emerald-100/40 backdrop-blur transition hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white via-emerald-50/70 to-white" aria-hidden="true" />
                <div className="absolute -left-5 top-1/2 hidden h-10 w-10 -translate-y-1/2 rounded-full bg-emerald-200/40 blur-2xl md:block" aria-hidden="true" />
                <div className="absolute -right-4 top-0 h-12 w-12 rounded-full bg-emerald-300/30 blur-3xl" aria-hidden="true" />
                <div className="relative flex items-start gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-400 text-white shadow-lg shadow-emerald-400/40">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-base font-semibold text-slate-900">{title}</h4>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                        {badge}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                    <div className="h-0.5 w-full rounded-full bg-gradient-to-r from-emerald-400/60 to-transparent" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
