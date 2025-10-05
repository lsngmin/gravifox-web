import { useTranslation } from 'react-i18next';
import { ArrowOutward } from '@mui/icons-material';
import { MessageSquare, Sparkles, Upload, ScanSearch, CheckCircle2, Mail,Map } from "lucide-react";

export default function PageSection() {
    const { t, i18n } = useTranslation('home');
    const lng = (i18n.language || 'en').slice(0, 2);

    const metrics = [
        { icon: Upload, value: "미디어 업로드", desc: "의심되는 이미지나 영상을 올려주세요." },
        { icon: ScanSearch, value: "분석", desc: "AI의 흔적을 찾고 주요 특징을 빠르게 분석합니다." },
        { icon: CheckCircle2, value: "판별", desc: "진위 판단과 함께 분석 근거를 보여드립니다." },
    ];
    const usageLabel = t('hero.usageLabel', 'How to use');
    const usageDescription = t(
        'hero.usageDescription',
        '세 단계만으로 분석을 시작하고 결과를 받아보세요.'
    );

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


                <div className="mt-4 space-y-12">
                    <div className="space-y-8 text-indigo-50">
                        <div className="space-y-5">
                            <h1
                                className="
    text-[20px] sm:text-4xl md:text-5xl lg:text-6xl
    font-extrabold tracking-tight leading-tight
    bg-gradient-to-br from-indigo-100 via-white to-indigo-200
    bg-clip-text text-transparent
    drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]
  "
                            >
                                {t('hero.headline')}
                            </h1>

                            <p className="flex items-start gap-2 text-[13px] sm:text-base md:text-lg lg:text-xl text-indigo-100/90 max-w-3xl leading-snug sm:leading-normal md:leading-relaxed bg-indigo-300/10 ring-1 ring-inset ring-white/10 rounded-xl px-3 py-2">
                                <Sparkles className="mt-0.5 h-4 w-4 opacity-80 flex-none text-amber-200/80" />
                                <span>
    {t('hero.subtitle')}
  </span>
                            </p>
                            <p className="flex items-start gap-2 text-[13px] sm:text-base md:text-lg lg:text-xl text-indigo-100/90 max-w-3xl leading-snug sm:leading-normal md:leading-relaxed bg-indigo-300/10 ring-1 ring-inset ring-white/10 rounded-xl px-3 py-2">
                                <Sparkles className="mt-0.5 h-4 w-4 opacity-80 flex-none text-amber-200/80" />
                                <span>
                                    복잡한 설정없이 의심스러운 사진만 올려주면 딥러닝 기술을 적용한 AI가 자동으로 파악해드려요.
                                </span>
                            </p>
                            <p className="flex items-start gap-2 text-[13px] sm:text-base md:text-lg lg:text-xl text-indigo-100/90 max-w-3xl leading-snug sm:leading-normal md:leading-relaxed bg-indigo-300/10 ring-1 ring-inset ring-white/10 rounded-xl px-3 py-2">
                                <Sparkles className="mt-0.5 h-4 w-4 opacity-80 flex-none text-amber-200/80" />
                                <span>
                                    지금은 테스트 기간이에요. 로그인하지 않아도 일정 횟수까지 무료로 이용하실 수 있어요.
                                </span>
                            </p>





                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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
  {/*                          <a*/}
  {/*                              href={`/${lng}/support`}*/}
  {/*                              className="*/}
  {/*  inline-flex items-center gap-2*/}
  {/*  text-sm font-semibold*/}
  {/*  text-indigo-300 hover:text-indigo-100*/}
  {/*  transition-all duration-200*/}
  {/*  hover:translate-x-0.5*/}
  {/*"*/}
  {/*                          >*/}
  {/*                              <MessageSquare className="h-4 w-4 text-indigo-300 group-hover:text-indigo-100 transition-colors duration-200" />*/}
  {/*                              {t('hero.feedback', '버그 제보 및 기능 제안하기')}*/}
  {/*                          </a>*/}

                        </div>
                        <div
                            className="
    mt-4 inline-flex flex-col sm:flex-row items-start sm:items-center gap-3
    rounded-2xl border border-white/10 bg-white/[0.06]
    px-4 py-3
    text-indigo-100/90
    backdrop-blur-sm
    transition hover:bg-white/[0.1] hover:shadow-[0_0_30px_-10px_rgba(56,189,248,0.3)]
  "
                        >
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-indigo-300" />
                                <span className="font-semibold text-sm">
      {t('hero.feedback', '버그 제보 및 기능 제안하기')}
    </span>
                            </div>

                            <p className="text-[13px] text-indigo-200/80 leading-snug sm:ml-2">
                                {t(
                                    'hero.feedbackNote',
                                    '서비스 개선에 도움이 된 제안이나 버그 제보를 보내주시면, 정식 오픈 시 Pro 플랜 혜택을 드릴 예정이에요.'
                                )}
                            </p>

                            <a
                                href={`/${lng}/support`}
                                className="
      ml-auto text-[12px] sm:text-sm font-semibold
      text-indigo-100
      transition-colors duration-200
    "
                            >
                                → 제안하러 가기
                            </a>
                        </div>
                        <div
                            className="
    mt-4 inline-flex flex-col sm:flex-row items-start sm:items-center gap-3
    rounded-2xl border border-white/10 bg-white/[0.05]
    px-4 py-3
    text-indigo-100/90
    backdrop-blur-sm
    transition hover:bg-white/[0.1] hover:shadow-[0_0_30px_-10px_rgba(147,197,253,0.25)]
  "
                        >
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-indigo-300" />
                                <span className="font-semibold text-sm">
      {t('hero.contact', '문의하기')}
    </span>
                            </div>

                            <p className="text-[13px] text-indigo-200/80 leading-snug sm:ml-2">
                                {t(
                                    'hero.contactNote',
                                    '협업 제안, 사용 중 궁금한 점, 기술 관련 문의는 언제든 환영해요. 가능한 빠르게 답변드릴게요.'
                                )}
                            </p>

                            <a
                                href={`/${lng}/contact`}
                                className="
      ml-auto text-[12px] sm:text-sm font-semibold
      text-indigo-100
      transition-colors duration-200
    "
                            >
                                → 문의하기
                            </a>
                        </div>
                        <div
                            className="
    mt-4 inline-flex flex-col sm:flex-row items-start sm:items-center gap-3
    rounded-2xl border border-white/10 bg-white/[0.05]
    px-4 py-3
    text-indigo-100/90
    backdrop-blur-sm
    transition hover:bg-white/[0.1] hover:shadow-[0_0_30px_-10px_rgba(147,197,253,0.25)]
  "
                        >
                            <div className="flex items-center gap-2">
                                <Map className="h-4 w-4 text-indigo-300" />
                                <span className="font-semibold text-sm">
      {t('hero.roadmap', '로드맵 보기')}
    </span>
                            </div>

                            <p className="text-[13px] text-indigo-200/80 leading-snug sm:ml-2">
                                {t(
                                    'hero.roadmapNote',
                                    '앞으로 추가될 기능과 개선 일정을 확인해보세요. 서비스의 방향을 함께 만들어가요.'
                                )}
                            </p>

                            <a
                                href={`/${lng}/roadmap`}
                                className="
      ml-auto text-[12px] sm:text-sm font-semibold
      text-indigo-100
      transition-colors duration-200
    "
                            >
                                → 로드맵 보기
                            </a>
                        </div>

                        {/*              <div className="space-y-4">*/}
          {/*                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200/80">*/}
          {/*                      <Sparkles className="h-3.5 w-3.5" />*/}
          {/*                      <span>{usageLabel}</span>*/}
          {/*                  </div>*/}
          {/*                  <p className="max-w-2xl text-sm sm:text-base text-indigo-100/80">*/}
          {/*                      {usageDescription}*/}
          {/*                  </p>*/}
          {/*                  <div className="grid gap-4 sm:grid-cols-3">*/}
          {/*                      {metrics.map((metric) => (*/}
          {/*                          <div*/}
          {/*                              key={metric.value}*/}
          {/*                              className="*/}
          {/*  group relative overflow-hidden*/}
          {/*  rounded-2xl border border-white/10 bg-white/[0.06]*/}
          {/*  px-5 py-5*/}
          {/*  text-indigo-100/90*/}
          {/*  backdrop-blur-sm*/}
          {/*  transition-all duration-300*/}
          {/*  hover:bg-white/[0.12] hover:translate-y-[-2px]*/}
          {/*  hover:shadow-[0_12px_40px_-20px_rgba(129,140,248,0.4)]*/}
          {/*"*/}
          {/*                          >*/}
          {/*                              <div className="flex items-center gap-3">*/}
          {/*                                  <metric.icon className="h-5 w-5 text-indigo-300/90 transition-transform duration-300 group-hover:scale-110" />*/}
          {/*                                  <h3 className="text-base font-semibold text-white tracking-tight">*/}
          {/*                                      {metric.value}*/}
          {/*                                  </h3>*/}
          {/*                              </div>*/}
          {/*                              <p className="mt-2 text-[13px] leading-relaxed text-indigo-100/80">*/}
          {/*                                  {metric.desc}*/}
          {/*                              </p>*/}

          {/*                              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-indigo-400/10 to-transparent" />*/}
          {/*                          </div>*/}
          {/*                      ))}*/}
          {/*                  </div>*/}
          {/*              </div>*/}
                    </div>
                </div>
            </div>
        </section>
    );
}
