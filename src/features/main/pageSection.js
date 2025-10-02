import { useTranslation } from 'react-i18next';
import { ArrowOutward, HeadsetMic, CheckCircle } from '@mui/icons-material';

export default function PageSection() {
    const { t, i18n } = useTranslation('home');
    const lng = (i18n.language || 'en').slice(0, 2);

    const metrics = [
        {
            value: t('hero.metrics.latency.value', '4.1s'),
            label: t('hero.metrics.latency.label', 'Median verdict'),
            desc: t('hero.metrics.latency.desc', 'Even during peak traffic windows.'),
        },
        {
            value: t('hero.metrics.accuracy.value', '99.3%'),
            label: t('hero.metrics.accuracy.label', 'Detection precision'),
            desc: t('hero.metrics.accuracy.desc', 'Continuously tuned on real incidents.'),
        },
        {
            value: t('hero.metrics.uptime.value', '24/7'),
            label: t('hero.metrics.uptime.label', 'Live response desk'),
            desc: t('hero.metrics.uptime.desc', 'On-call specialists in three regions.'),
        },
    ];

    const bulletPoints = t('hero.bullets', {
        returnObjects: true,
        defaultValue: [
            'Stop GenAI image uploads before they go live.',
            'Give reviewers authenticity evidence they can trust.',
            'Connect verdicts to the workflows you already use.',
        ],
    });

    return (
        <section className="relative isolate overflow-hidden">
            <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-900 to-slate-900"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.35),_transparent_65%)]"
                aria-hidden="true"
            />
            <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28 lg:py-32">
                <div className="mx-auto max-w-5xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-200 shadow-lg shadow-indigo-500/20">
                        {t('hero.ribbon', 'AI-FIRST DEFENSE STACK')}
                    </div>
                </div>

                <div className="mt-10 grid gap-12 lg:grid-cols-[1.25fr_0.9fr] lg:items-center">
                    <div className="space-y-8 text-indigo-50">
                        <div className="space-y-5">
                            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                                {t('hero.headline', 'Stop synthetic media before it hits your users')}
                            </h1>
                            <p className="text-base sm:text-lg text-indigo-100/90 max-w-3xl">
                                {t(
                                    'hero.subtitle',
                                    '몇 초 만에 분석 결과를 확인하세요. 인프라/ML 전문지식은 필요 없습니다.'
                                )}
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <a
                                href={`/${lng}/analyze`}
                                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-900 shadow-[0_20px_40px_-20px_rgba(129,140,248,0.65)] transition hover:bg-indigo-50 hover:shadow-[0_28px_50px_-24px_rgba(129,140,248,0.75)]"
                            >
                                {t('cta.start', '무료로 시작하기')}
                                <ArrowOutward className="ml-2 h-5 w-5" />
                            </a>
                            <a
                                href={`/${lng}/pricing`}
                                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-transparent px-7 py-3 text-sm font-semibold text-indigo-100 transition hover:bg-white/10"
                            >
                                {t('cta.pricing', '요금제 보기')}
                            </a>
                            <a
                                href={`/${lng}/support`}
                                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-200"
                            >
                                <HeadsetMic className="h-4 w-4" />
                                {t('hero.talkToTeam', 'Talk to our team in under 24 hours')}
                            </a>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            {metrics.map((metric) => (
                                <div
                                    key={metric.label}
                                    className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-indigo-100/90 shadow-[0_24px_40px_-28px_rgba(15,23,42,0.9)]"
                                >
                                    <div className="text-2xl font-bold text-white">{metric.value}</div>
                                    <div className="text-xs font-semibold uppercase tracking-wide text-indigo-200/80">
                                        {metric.label}
                                    </div>
                                    <div className="mt-2 text-xs text-indigo-100/70">{metric.desc}</div>
                                </div>
                            ))}
                        </div>

                        <ul className="mt-6 space-y-3 text-sm text-indigo-100/80">
                            {bulletPoints.map((line, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
                                    <span>{line}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="relative flex flex-col gap-4">
                        {t('hero.cards', {
                            returnObjects: true,
                            defaultValue: [],
                        }).map((card, idx) => (
                            <article
                                key={idx}
                                className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-6 text-indigo-100 shadow-[0_30px_60px_-35px_rgba(15,23,42,0.95)] backdrop-blur"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/18 via-indigo-400/10 to-white/5" aria-hidden="true" />
                                <div className="relative flex flex-col gap-4">
                                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-indigo-200/90">
                                        <span>{card.pill}</span>
                                        <span className="rounded-full bg-white/15 px-3 py-1 text-indigo-100/90">
                                            {String(idx + 1).padStart(2, '0')}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-base font-semibold text-white">{card.title}</h3>
                                        <p className="text-sm text-indigo-100/80 leading-relaxed">{card.body}</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/15 bg-indigo-500/20 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-indigo-50">
                                        {card.footer}
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
