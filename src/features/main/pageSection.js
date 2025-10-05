import { useTranslation } from 'react-i18next';
import { ArrowOutward, CheckCircle } from '@mui/icons-material';
import { MessageSquare, Sparkles, Upload, ScanSearch, CheckCircle2 } from "lucide-react";

export default function PageSection() {
    const { t, i18n } = useTranslation('home');
    const lng = (i18n.language || 'en').slice(0, 2);

    const metrics = [
        { icon: Upload, value: "미디어 업로드", desc: "의심되는 이미지나 영상을 올려주세요." },
        { icon: ScanSearch, value: "분석", desc: "AI의 흔적을 찾고 주요 특징을 빠르게 분석합니다." },
        { icon: CheckCircle2, value: "판별", desc: "진위 판단과 함께 분석 근거를 보여드립니다." },
    ];


    const bulletPoints = t('hero.bullets', {
        returnObjects: true,
        defaultValue: [
            'Upload any photo to check if it looks AI-generated in seconds.',
            'Review the highlighted clues that explain the verdict.',
            'Share a simple link so anyone can see the result.',
        ],
    });

    const quickGuides = t('hero.cards', {
        returnObjects: true,
        defaultValue: [
            {
                title: 'Try it first with a sample',
                desc: 'Open a sample image to watch the analysis unfold in real time.',
            },
            {
                title: 'Upload your own photo',
                desc: 'Drag a file or paste a link and get the verdict within seconds.',
            },
        ],
    }).slice(0, 2);

    const cardsLabel = t('hero.cardsLabel', 'Quick start');

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
            <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:py-32">
                <div className="mx-auto max-w-5xl">
                    <div className="flex justify-center sm:justify-start">
                        <div className="
    inline-flex items-center gap-1.5 sm:gap-2
    rounded-full border border-white/20 bg-white/10
    px-2.5 py-0.5 sm:px-4 sm:py-1 md:px-5 md:py-1.5
    text-[10px] sm:text-xs md:text-sm font-semibold uppercase
    tracking-[0.08em] sm:tracking-[0.1em]
    text-indigo-200 shadow-md sm:shadow-lg shadow-indigo-500/20
  ">
                            {t('hero.ribbon')}
                        </div>
                    </div>
                </div>


                <div className="mt-6 grid gap-12 lg:grid-cols-[1.25fr_0.9fr] lg:items-center">
                    <div className="space-y-8 text-indigo-50">
                        <div className="space-y-5 text-center sm:text-left">
                            <h1 className="text-[26px] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                                {t('hero.headline')}
                            </h1>

                            <p className="mx-auto flex max-w-3xl items-start gap-2 rounded-xl bg-indigo-300/10 px-3 py-2 text-[13px] leading-snug text-indigo-100/90 ring-1 ring-inset ring-white/10 sm:mx-0 sm:text-base sm:leading-normal md:text-lg md:leading-relaxed lg:text-xl">
                                <Sparkles className="mt-0.5 h-4 w-4 flex-none opacity-80" />
                                <span>{t('hero.subtitle')}</span>
                            </p>





                        </div>

                        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
                            <a
                                href={`/${lng}/analyze`}
                                className="
    inline-flex items-center justify-center rounded-full
    bg-white
    px-5 py-2.5 sm:px-7 sm:py-3
    text-xs sm:text-sm md:text-base
    font-semibold text-slate-900
    shadow-[0_16px_32px_-16px_rgba(129,140,248,0.65)]
    sm:shadow-[0_20px_40px_-20px_rgba(129,140,248,0.65)]
    transition
    hover:bg-indigo-50
    hover:shadow-[0_24px_48px_-24px_rgba(129,140,248,0.75)]
  "
                            >
                                {t('cta.start')}
                                <ArrowOutward className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                            </a>
                            <a
                                href={`/${lng}/pricing`}
                                className="
    inline-flex items-center justify-center rounded-full
    border border-white/25 sm:border-white/30
    bg-transparent
    px-5 py-2.5 sm:px-7 sm:py-3
    text-xs sm:text-sm md:text-base
    font-semibold text-indigo-100
    transition
    hover:bg-white/10 hover:border-white/40
  "
                            >
                                {t('cta.pricing', '요금제 보기')}
                            </a>
                            <a
                                href={`/${lng}/support`}
                                className="
    inline-flex items-center gap-2
    text-sm font-semibold
    text-indigo-300 transition-all duration-200 hover:translate-x-0.5 hover:text-indigo-100
  "
                            >
                                <MessageSquare className="h-4 w-4 text-indigo-300 group-hover:text-indigo-100 transition-colors duration-200" />
                                {t('hero.feedback', '버그 제보 및 기능 제안하기')}
                            </a>

                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                            {metrics.map((metric, i) => (
                                <div
                                    key={metric.value}
                                    className="
            group relative overflow-hidden
            rounded-2xl border border-white/10 bg-white/[0.06]
            px-4 py-4 sm:px-5 sm:py-5
            text-indigo-100/90
            backdrop-blur-sm
            transition-all duration-300
            hover:bg-white/[0.12] hover:translate-y-[-2px]
            hover:shadow-[0_12px_40px_-20px_rgba(129,140,248,0.4)]
          "
                                >
                                    <div className="flex items-center gap-3">
                                        <metric.icon className="h-5 w-5 text-indigo-300/90 transition-transform duration-300 group-hover:scale-110" />
                                        <h3 className="text-base font-semibold text-white tracking-tight">
                                            {metric.value}
                                        </h3>
                                    </div>
                                    <p className="mt-2 text-[13px] leading-relaxed text-indigo-100/80">
                                        {metric.desc}
                                    </p>

                                    {/* subtle gradient glow */}
                                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-indigo-400/10 to-transparent" />
                                </div>
                            ))}
                        </div>

                        <ul className="mt-6 grid gap-3 text-left text-sm text-indigo-100/80 sm:hidden">
                            {bulletPoints.map((line, idx) => (
                                <li key={idx} className="flex items-start gap-2 rounded-2xl bg-white/5 px-3 py-2">
                                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
                                    <span>{line}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {quickGuides.length > 0 && (
                        <div className="relative -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 sm:mx-0 sm:grid sm:grid-cols-1 sm:gap-4 sm:overflow-visible sm:pb-0 lg:gap-6">
                            {quickGuides.map((card, idx) => (
                                <article
                                    key={`${card.title}-${idx}`}
                                    className="relative min-w-[260px] snap-start overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-6 text-indigo-100 shadow-[0_30px_60px_-35px_rgba(15,23,42,0.95)] backdrop-blur sm:min-w-0"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/18 via-indigo-400/10 to-white/5" aria-hidden="true" />
                                    <div className="relative flex flex-col gap-3">
                                        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200/90">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm text-indigo-50">
                                                {String(idx + 1)}
                                            </span>
                                            <span className="text-indigo-100/80">{cardsLabel}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                                            {card.desc && (
                                                <p className="text-sm leading-relaxed text-indigo-100/80">{card.desc}</p>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
