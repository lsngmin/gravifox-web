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
        value: t('hero.metrics.timeValue', '최대 14일 빠른 시작'),
        copy: t(
          'hero.metrics.timeCopy',
          '빠른 템플릿과 샘플 파이프라인으로 첫 결과를 바로 확인해 보세요.'
        ),
      },
      {
        label: t('hero.metrics.scaleLabel', '확장 준비'),
        value: t('hero.metrics.scaleValue', '트래픽 급증에도 안정적'),
        copy: t(
          'hero.metrics.scaleCopy',
          '팀 규모가 커져도 자동 스케일링으로 걱정 없이 운영할 수 있어요.'
        ),
      },
      {
        label: t('hero.metrics.securityLabel', '안심 보안'),
        value: t('hero.metrics.securityValue', '엔드투엔드 보호'),
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
              {t('hero.ribbon', 'PRICING THAT GROWS WITH YOU')}
            </div>
            <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {t('hero.title', '가볍게 시작하고, 필요한 순간에만 확장하세요')}
            </h1>
            <p className="mt-4 text-sm md:text-base text-slate-600 max-w-3xl mx-auto">
              {t(
                'hero.subtitle',
                '무료로 먼저 써 본 뒤, 필요한 기능만 골라 부담 없이 이어갈 수 있도록 요금제를 준비했어요.'
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

        {/* Narrative CTA */}
        <section className="relative -mt-6 max-w-6xl mx-auto px-6 pb-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white via-white/70 to-transparent" aria-hidden="true" />
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 px-6 py-8 md:px-10 md:py-12 text-slate-200 shadow-xl overflow-hidden relative">
            <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.35),transparent)] opacity-70" aria-hidden="true" />
            <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  {t('story.headline', '매일 좋아지는 AI, 요금은 예상 그대로')}
                </h2>
                <p className="mt-4 text-sm md:text-base text-slate-300">
                  {t('story.copy', 'GraviFox는 새로 등장하는 GenAI 트렌드를 빠르게 반영하면서도, 복잡한 옵션 없이 필요한 만큼만 비용을 쓰도록 도와드려요.')}
                </p>
              </div>
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-indigo-200">01</span>
                  <p className="text-sm text-slate-200">
                    {t('story.point1', '모든 요금제에 24시간 내 최신 모델을 반영해 드려요.')}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-indigo-200">02</span>
                  <p className="text-sm text-slate-200">
                    {t('story.point2', '정확도와 비용의 균형을 직접 비교하며 선택할 수 있어요.')}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-indigo-200">03</span>
                  <p className="text-sm text-slate-200">
                    {t('story.point3', '버튼 한 번으로 엔터프라이즈 옵션까지 전환할 수 있어요.')}
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
                  <p className="mt-1 text-sm text-slate-600">{t('free.subtitle', '필수 기능으로 충분한 시작')}</p>
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
                  <div className="absolute -top-3 right-4 inline-flex items-center rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">가장 인기</div>
                  <div className="mb-1 text-xs font-semibold tracking-wide text-indigo-600">{t('pro.badge', 'Pro')}</div>
                  <h3 className="text-xl font-semibold text-slate-900">{t('pro.title', '프로 요금제')}</h3>
                  <p className="mt-1 text-sm text-slate-600">{t('pro.subtitle', '서비스에 바로 적용할 준비가 됐을 때')}</p>
                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">{t('pro.price', '₩19,000')}</span>
                    <span className="text-sm text-slate-500">{t('pro.per', '/ 월')}</span>
                  </div>
                  <div className="mt-5 h-px w-full bg-slate-200" />
                  <ul className="mt-5 space-y-3.5 text-base text-slate-700">
                    <li className="flex items-center gap-3"><Check className="text-indigo-600" size={12} /> <span>{t('pro.features.tokens', '월 500회 이미지 분석 제공')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-indigo-600" size={12} /> <span>{t('pro.features.queue', '우선 처리 큐 & 속도 보장')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-indigo-600" size={12} /> <span>{t('pro.features.metrics', '고급 활용 지표 & 알림')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-indigo-600" size={12} /> <span>{t('pro.features.models', '확장된 모델 & 프리셋')}</span></li>
                  </ul>
                  <div className="mt-auto pt-6">
                    <motion.a
                      href="/support"
                      className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                      whileTap={buttonTapEffect}
                      whileHover={buttonHoverEffect}
                    >
                      {t('pro.cta', '상담 요청하기')}
                    </motion.a>
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
                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">{t('enterprise.price', '맞춤 견적')}</span>
                    <span className="text-sm text-slate-500">{t('enterprise.per', '/ 월')}</span>
                  </div>
                  <div className="mt-5 h-px w-full bg-slate-200" />
                  <ul className="mt-5 space-y-3.5 text-base text-slate-700">
                    <li className="flex items-center gap-3"><Check className="text-blue-600" size={12} /> <span>{t('enterprise.features.sso', 'SSO / SAML 연동')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-blue-600" size={12} /> <span>{t('enterprise.features.infra', '전용 인프라와 리전 선택')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-blue-600" size={12} /> <span>{t('enterprise.features.sla', 'SLA & 전담 기술 지원')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-blue-600" size={12} /> <span>{t('enterprise.features.audit', '보안·감사 로그 및 컴플라이언스')}</span></li>
                  </ul>
                  <div className="mt-auto pt-6">
                    <motion.a
                      href="/support"
                      className="inline-flex w-full items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600"
                      whileTap={buttonTapEffect}
                      whileHover={buttonHoverEffect}
                    >
                      {t('enterprise.cta', '세일즈 팀에 문의하기')}
                    </motion.a>
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
                  {t('postPlans.headline', '플랜 전환은 클릭 한 번, 데이터는 그대로 남아요')}
                </h3>
                <p className="mt-4 text-sm md:text-base text-slate-600">
                  {t('postPlans.copy', '언제든지 업그레이드하거나 다운그레이드해도 저장된 분석과 웹훅 설정은 유지돼요. PoC부터 전면 도입까지 한 흐름으로 이어집니다.')}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-indigo-100/70">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">{t('postPlans.metrics.label', '추천 사용 순서')}</p>
                <div className="mt-3 space-y-3 text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">1</span>
                    <p>{t('postPlans.metrics.step1', 'Free → 토큰 사용 패턴과 팀 협업 방식 확인')}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">2</span>
                    <p>{t('postPlans.metrics.step2', 'Pro → 실서비스 알림과 모니터링을 연결해 운영 지표 쌓기')}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">3</span>
                    <p>{t('postPlans.metrics.step3', 'Enterprise → 글로벌 리전과 맞춤 SLA, 커스텀 워크플로 적용')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footnote */}
          <div className="mt-10 space-y-2 text-center text-xs text-slate-500">
            <p>{t('footnote.disclaimer1', '표시된 금액은 예시이며, 실제 가격은 사용량과 계약 조건에 따라 조정될 수 있어요.')}</p>
            <p>{t('footnote.disclaimer2', 'Enterprise 고객에게는 온보딩 시 보안 점검과 데이터 거버넌스 컨설팅을 함께 제공해요.')}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
