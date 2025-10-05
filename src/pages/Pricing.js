import React, { useMemo } from 'react';
import Navigation from '../features/navigation/navigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';

const Check = ({ className = 'text-emerald-500', size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
    <path d="M13.4 4.36L6.12 11.64 2.6 8.12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Pricing() {
  const { t } = useTranslation('pricing');
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const heroMetrics = useMemo(
    () => [
      {
        label: t('hero.metrics.timeLabel', '런칭 속도'),
        value: t('hero.metrics.timeValue', '테스트 기간에도 전 기능 개방'),
        copy: t(
          'hero.metrics.timeCopy',
          '빠른 템플릿과 샘플 파이프라인으로 첫 결과를 바로 확인할 수 있어요.'
        ),
      },
      {
        label: t('hero.metrics.scaleLabel', '확장 준비'),
        value: t('hero.metrics.scaleValue', '유료 전환 없이도 확장 시뮬레이션'),
        copy: t(
          'hero.metrics.scaleCopy',
          '현재는 Free 플랜으로도 예상 워크로드를 충분히 검증할 수 있어요.'
        ),
      },
      {
        label: t('hero.metrics.securityLabel', '안심 보안'),
        value: t('hero.metrics.securityValue', '테스트 계정도 동일한 보호'),
        copy: t(
          'hero.metrics.securityCopy',
          '권한 제어와 감사 로그를 기본으로 제공해 모든 팀원이 편하게 협업해요.'
        ),
      },
    ],
    [t]
  );

  const animateProps = { opacity: 1, y: 0 };

  const getInitial = (desktopY = 8) =>
    isMobile
      ? { opacity: 1, y: 0 }
      : {
          opacity: 0,
          y: desktopY,
        };

  const getTransition = (delay = 0) => ({ duration: 0.4, ease: 'easeOut', delay });

  const buttonHoverEffect = !isMobile ? { scale: 1.01 } : undefined;
  const buttonTapEffect = !isMobile ? { scale: 0.99 } : undefined;

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navigation />

      <main className="relative">
        {/* Hero */}
        <section className="relative overflow-hidden pt-24 sm:pt-28 lg:pt-32 pb-12">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-100 via-white to-emerald-100" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/80 to-transparent" aria-hidden="true" />
          <div className="relative max-w-6xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600 shadow-sm ring-1 ring-indigo-200/60">
              {t('hero.ribbon', 'PUBLIC BETA NOTICE')}
            </div>
            <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {t('hero.title', '지금은 무료 요금제로만 체험해 주세요')}
            </h1>
            <p className="mt-4 text-sm md:text-base text-slate-600 max-w-3xl mx-auto">
              {t(
                'hero.subtitle',
                '공개 테스트 기간 동안 모든 핵심 기능을 무료로 제공하며, 유료 요금제는 준비 중이에요.'
              )}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto text-left">
              {heroMetrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-indigo-100/60"
                  initial={getInitial(20)}
                  animate={animateProps}
                  transition={getTransition(0.04 * index)}
                >
                  <p className="text-xs font-semibold text-indigo-500">{metric.label}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{metric.value}</p>
                  <p className="mt-2 text-xs text-slate-600">{metric.copy}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent via-white/60 to-white" aria-hidden="true" />
        </section>

        {/* Beta notice */}
        <section className="relative -mt-6 max-w-6xl mx-auto px-6 pb-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white via-white/70 to-transparent" aria-hidden="true" />
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 px-6 py-8 md:px-10 md:py-12 text-slate-200 shadow-xl overflow-hidden relative">
            <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.35),transparent)] opacity-70" aria-hidden="true" />
            <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-indigo-200">
                  {t('betaNotice.badge', 'Public Beta')}
                </p>
                <h2 className="mt-4 text-2xl md:text-3xl font-bold text-white leading-tight">
                  {t('betaNotice.title', '현재 유료 요금제는 준비 중이에요')}
                </h2>
                <p className="mt-4 text-sm md:text-base text-slate-300">
                  {t('betaNotice.copy', '안정화와 피드백 수집을 위해 공개 테스트를 진행 중이에요. 지금은 Free 플랜만 제공하며, 유료 전환 경로는 모두 비활성화했어요.')}
                </p>
                <p className="mt-3 text-xs md:text-sm text-indigo-200/90">
                  {t('betaNotice.note', '정식 플랜이 열리면 대시보드와 이메일 알림을 통해 가장 먼저 알려드릴게요.')}
                </p>
              </div>
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-indigo-200">01</span>
                  <p className="text-sm text-slate-200">
                    {t('betaNotice.points.one', 'Free 플랜으로 모든 핵심 기능을 제한 없이 체험해 보세요.')}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-indigo-200">02</span>
                  <p className="text-sm text-slate-200">
                    {t('betaNotice.points.two', '피드백을 보내 주시면 정식 요금제 구성에 적극 반영할게요.')}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-indigo-200">03</span>
                  <p className="text-sm text-slate-200">
                    {t('betaNotice.points.three', '유료 플랜이 다시 열리면 대시보드에서 안전하게 전환할 수 있어요.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Free */}
            <div className="w-full">
              <div className="relative h-full rounded-2xl bg-gradient-to-br from-indigo-100/20 via-slate-50 to-purple-100/20 p-[1px]">
                <motion.div
                  className="rounded-2xl bg-gradient-to-br from-white/96 via-slate-50/80 to-indigo-50/60 backdrop-blur-sm ring-1 ring-slate-200/60 p-6 md:p-8 shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full"
                  initial={getInitial(24)}
                  animate={animateProps}
                  transition={getTransition(0.03)}
                >
                  <div className="mb-1 text-xs font-semibold tracking-wide text-indigo-600">{t('free.badge', 'Free')}</div>
                  <h3 className="text-xl font-semibold text-slate-900">{t('free.title', '무료 요금제')}</h3>
                  <p className="mt-1 text-sm text-slate-600">{t('free.subtitle', '베타 기간에도 제한 없이 활용해 보세요')}</p>
                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">{t('free.price', '₩0')}</span>
                    <span className="text-sm text-slate-500">{t('free.per', '/ 월')}</span>
                  </div>
                  <div className="mt-5 h-px w-full bg-slate-200" />
                  <ul className="mt-5 space-y-3.5 text-base text-slate-700">
                    <li className="flex items-center gap-3"><Check className="text-emerald-600" size={12} /> <span>{t('free.features.tokens', '월 20회 이미지 분석 제공')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-emerald-600" size={12} /> <span>{t('free.features.queue', '기본 우선순위 처리 큐')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-emerald-600" size={12} /> <span>{t('free.features.metrics', '핵심 활용 지표 확인')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-emerald-600" size={12} /> <span>{t('free.features.models', '대표 모델 체험')}</span></li>
                  </ul>
                  <div className="mt-auto pt-6">
                    <motion.a
                      href="/login"
                      className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                      whileTap={buttonTapEffect}
                      whileHover={buttonHoverEffect}
                    >
                      {t('free.cta', '지금 시작하기')}
                    </motion.a>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Pro */}
            <div className="w-full">
              <div className="relative h-full rounded-2xl bg-gradient-to-br from-indigo-600/25 via-indigo-400/20 to-indigo-300/25 p-[1px]">
                <motion.div
                  className="rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white/90 to-indigo-100/85 backdrop-blur-sm ring-1 ring-indigo-200/60 p-6 md:p-8 shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full"
                  initial={getInitial(24)}
                  animate={animateProps}
                  transition={getTransition(0.06)}
                >
                  <div className="absolute -top-3 right-4 inline-flex items-center rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">{t('pro.highlight', '준비 중')}</div>
                  <div className="mb-1 text-xs font-semibold tracking-wide text-indigo-600">{t('pro.badge', 'Pro')}</div>
                  <h3 className="text-xl font-semibold text-slate-900">{t('pro.title', '프로 요금제')}</h3>
                  <p className="mt-1 text-sm text-slate-600">{t('pro.subtitle', '정식 출시 준비를 위해 내부 검증 중이에요')}</p>
                  <div className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-xs font-medium text-indigo-600 ring-1 ring-indigo-200/70">
                    {t('pro.betaMessage', '현재는 Free 플랜에서 동일한 분석 기능을 체험해 주세요.')}
                  </div>
                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">{t('pro.price', '준비 중')}</span>
                    <span className="text-sm text-slate-500">{t('pro.per', '')}</span>
                  </div>
                  <div className="mt-5 h-px w-full bg-slate-200" />
                  <ul className="mt-5 space-y-3.5 text-base text-slate-700">
                    <li className="flex items-center gap-3"><Check className="text-indigo-600" size={12} /> <span>{t('pro.features.tokens', '월 500회 이미지 분석 제공 (예정)')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-indigo-600" size={12} /> <span>{t('pro.features.queue', '우선 처리 큐 & 속도 보장 (예정)')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-indigo-600" size={12} /> <span>{t('pro.features.metrics', '고급 활용 지표 & 알림 (예정)')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-indigo-600" size={12} /> <span>{t('pro.features.models', '확장된 모델 & 프리셋 (예정)')}</span></li>
                  </ul>
                  <div className="mt-auto pt-6">
                    <div
                      className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900/40 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-sm cursor-not-allowed"
                      aria-disabled="true"
                    >
                      {t('pro.ctaDisabled', '출시 준비 중')}
                    </div>
                    <p className="mt-2 text-xs text-slate-500 text-center">{t('pro.notice', '비공개 테스트가 완료되면 바로 안내드릴게요.')}</p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Enterprise */}
            <div className="w-full">
              <div className="relative h-full rounded-2xl bg-gradient-to-br from-slate-400/25 via-blue-300/20 to-slate-300/25 p-[1px]">
                <motion.div
                  className="rounded-2xl bg-gradient-to-br from-white/90 via-blue-50/85 to-slate-50/85 backdrop-blur-sm ring-1 ring-blue-200/60 p-6 md:p-8 shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full"
                  initial={getInitial(24)}
                  animate={animateProps}
                  transition={getTransition(0.09)}
                >
                  <div className="mb-1 text-xs font-semibold tracking-wide text-blue-700">{t('enterprise.badge', 'Enterprise')}</div>
                  <h3 className="text-xl font-semibold text-slate-900">{t('enterprise.title', '엔터프라이즈')}</h3>
                  <p className="mt-1 text-sm text-slate-600">{t('enterprise.subtitle', '보안·확장성·전담 지원이 필요한 기업을 위해')}</p>
                  <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 ring-1 ring-blue-200/70">
                    {t('enterprise.betaMessage', '엔터프라이즈 커버리지는 정식 론칭과 함께 공개될 예정이에요.')}
                  </div>
                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">{t('enterprise.price', '준비 중')}</span>
                    <span className="text-sm text-slate-500">{t('enterprise.per', '')}</span>
                  </div>
                  <div className="mt-5 h-px w-full bg-slate-200" />
                  <ul className="mt-5 space-y-3.5 text-base text-slate-700">
                    <li className="flex items-center gap-3"><Check className="text-blue-600" size={12} /> <span>{t('enterprise.features.sso', 'SSO / SAML 연동 (예정)')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-blue-600" size={12} /> <span>{t('enterprise.features.infra', '전용 인프라와 리전 선택 (예정)')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-blue-600" size={12} /> <span>{t('enterprise.features.sla', 'SLA & 전담 기술 지원 (예정)')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-blue-600" size={12} /> <span>{t('enterprise.features.audit', '보안·감사 로그 및 컴플라이언스 (예정)')}</span></li>
                  </ul>
                  <div className="mt-auto pt-6">
                    <div
                      className="inline-flex w-full items-center justify-center rounded-lg bg-blue-700/40 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-sm cursor-not-allowed"
                      aria-disabled="true"
                    >
                      {t('enterprise.ctaDisabled', '출시 준비 중')}
                    </div>
                    <p className="mt-2 text-xs text-slate-500 text-center">{t('enterprise.notice', '엔터프라이즈 요구사항은 베타 종료 후 맞춤으로 안내드릴 예정이에요.')}</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Post-plan narrative */}
          <div className="mt-14 rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-indigo-50 px-6 py-10 shadow-inner md:px-10 md:py-12">
            <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
              <div>
                <h3 className="text-xl md:text-2xl font-semibold text-slate-900">
                  {t('postPlans.headline', '베타 기간 로드맵을 함께 만들어 가고 있어요')}
                </h3>
                <p className="mt-4 text-sm md:text-base text-slate-600">
                  {t('postPlans.copy', 'Free 플랜으로 기능을 충분히 체험하고, 필요한 시나리오를 알려 주세요. 정식 Pro · Enterprise 옵션은 베타 종료와 함께 순차적으로 공개될 예정이에요.')}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-indigo-100/70">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">{t('postPlans.metrics.label', '추천 사용 순서')}</p>
                <div className="mt-3 space-y-3 text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">1</span>
                    <p>{t('postPlans.metrics.step1', 'Free → 현재는 전 기능을 무료로 체험하며 워크로드를 검증')}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">2</span>
                    <p>{t('postPlans.metrics.step2', 'Pro (예정) → 베타 피드백을 바탕으로 정식 출시 시 세밀한 운영 지표 제공')}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">3</span>
                    <p>{t('postPlans.metrics.step3', 'Enterprise (예정) → 맞춤 SLA와 전용 인프라는 베타 종료 후 협의')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footnote */}
          <div className="mt-10 space-y-2 text-center text-xs text-slate-500">
            <p>{t('footnote.disclaimer1', '현재는 테스트 기간으로 모든 과금이 중단된 상태예요. 정식 요금은 출시 시점에 투명하게 공개할게요.')}</p>
            <p>{t('footnote.disclaimer2', '유료 플랜 재개 전까지는 결제 정보가 저장되지 않으며, Enterprise 상담도 사전 예약만 받고 있어요.')}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
