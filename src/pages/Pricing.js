import React from 'react';
import Navigation from '../features/navigation/navigation';
import { useTranslation } from 'react-i18next';

const Check = ({ className = 'text-emerald-500', size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
    <path d="M13.4 4.36L6.12 11.64 2.6 8.12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Pricing() {
  const { t } = useTranslation('pricing');
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
              {t('hero.ribbon', 'FUTURE-READY PRICING')}
            </div>
            <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {t('hero.title', '간단하고 투명한 요금제')}
            </h1>
            <p className="mt-4 text-sm md:text-base text-slate-600 max-w-3xl mx-auto">
              {t('hero.subtitle', '무료로 시작해 프로로 확장하세요. 우아하고 투명하게.')}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto text-left">
              <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-indigo-100/60">
                <p className="text-xs font-semibold text-indigo-500">{t('hero.metrics.timeLabel', '빌드 타임')}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{t('hero.metrics.timeValue', '평균 14일 단축')}</p>
                <p className="mt-2 text-xs text-slate-600">{t('hero.metrics.timeCopy', '바로 연결 가능한 API와 SDK, 즉시 검증 가능한 샘플 파이프라인')}</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-indigo-100/60">
                <p className="text-xs font-semibold text-indigo-500">{t('hero.metrics.scaleLabel', '확장')}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{t('hero.metrics.scaleValue', 'AI 워크로드 자동 스케일')}</p>
                <p className="mt-2 text-xs text-slate-600">{t('hero.metrics.scaleCopy', '트래픽 급증 상황에서도 모델 전환 없이 탄력적으로 운영')}</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-indigo-100/60">
                <p className="text-xs font-semibold text-indigo-500">{t('hero.metrics.securityLabel', '보안')}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{t('hero.metrics.securityValue', '엔드투엔드 암호화')}</p>
                <p className="mt-2 text-xs text-slate-600">{t('hero.metrics.securityCopy', '전용 리전, 감사 추적과 연동되는 권한 제어')}</p>
              </div>
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
                  {t('story.headline', '매일 업그레이드되는 AI 품질, 계획은 그대로')}
                </h2>
                <p className="mt-4 text-sm md:text-base text-slate-300">
                  {t('story.copy', 'GraviFox는 새로 등장하는 GenAI 이미지 징후를 바로 반영합니다. 요금제는 복잡하지 않게 유지하면서, 모델 업데이트와 성능 향상을 계속 제공합니다.')}
                </p>
              </div>
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-indigo-200">01</span>
                  <p className="text-sm text-slate-200">
                    {t('story.point1', '24시간 이내 자동 업데이트된 모델을 모든 요금제에 배포합니다.')}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-indigo-200">02</span>
                  <p className="text-sm text-slate-200">
                    {t('story.point2', '정확도 향상과 비용 최적화를 동시에 고려한 플랜 구성으로 장기 운영에 유리합니다.')}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-indigo-200">03</span>
                  <p className="text-sm text-slate-200">
                    {t('story.point3', '필요하면 언제든지 엔터프라이즈 옵션으로 확장 가능하며, 다운타임 없이 플랜을 전환할 수 있습니다.')}
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
                <div className="rounded-2xl bg-gradient-to-br from-white/96 via-slate-50/80 to-indigo-50/60 backdrop-blur-sm ring-1 ring-slate-200/60 p-6 md:p-8 shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full">
                  <div className="mb-1 text-xs font-semibold tracking-wide text-indigo-600">{t('free.badge','Free')}</div>
                  <h3 className="text-xl font-semibold text-slate-900">{t('free.title','무료 요금제')}</h3>
                  <p className="mt-1 text-sm text-slate-600">{t('free.subtitle','필수 기능으로 충분한 시작')}</p>
                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">{t('free.price','₩0')}</span>
                    <span className="text-sm text-slate-500">{t('free.per','/ 월')}</span>
                  </div>
                  <div className="mt-5 h-px w-full bg-slate-200" />
                  <ul className="mt-5 space-y-3.5 text-base text-slate-700">
                    <li className="flex items-center gap-3"><Check className="text-emerald-600" size={12} /> <span>{t('free.features.tokens','월 20건 분석 토큰 제공')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-emerald-600" size={12} /> <span>{t('free.features.queue','낮은 우선순위 처리 큐')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-emerald-600" size={12} /> <span>{t('free.features.metrics','제한적 분석 지표')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-emerald-600" size={12} /> <span>{t('free.features.models','제한적 분석 모델')}</span></li>
                  </ul>
                  <div className="mt-auto pt-6">
                    <a href="/login" className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">{t('free.cta','지금 시작하기')}</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Pro */}
            <div className="w-full">
              <div className="relative h-full rounded-2xl bg-gradient-to-br from-indigo-600/25 via-indigo-400/20 to-indigo-300/25 p-[1px]">
                <div className="rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white/90 to-indigo-100/85 backdrop-blur-sm ring-1 ring-indigo-200/60 p-6 md:p-8 shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full">
                  <div className="absolute -top-3 right-4 inline-flex items-center rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">가장 인기</div>
                  <div className="mb-1 text-xs font-semibold tracking-wide text-indigo-600">{t('pro.badge','Pro')}</div>
                  <h3 className="text-xl font-semibold text-slate-900">{t('pro.title','프로 요금제')}</h3>
                  <p className="mt-1 text-sm text-slate-600">{t('pro.subtitle','리스크 없이 품질을 확인하세요')}</p>
                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">{t('pro.price','₩19,000')}</span>
                    <span className="text-sm text-slate-500">{t('pro.per','/ 월')}</span>
                  </div>
                  <div className="mt-5 h-px w-full bg-slate-200" />
                  <ul className="mt-5 space-y-3.5 text-base text-slate-700">
                    <li className="flex items-center gap-3"><Check className="text-indigo-600" size={12} /> <span>{t('pro.features.tokens','월 500건 분석 토큰 제공')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-indigo-600" size={12} /> <span>{t('pro.features.queue','높은 우선순위 처리 큐')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-indigo-600" size={12} /> <span>{t('pro.features.metrics','고급 분석 지표')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-indigo-600" size={12} /> <span>{t('pro.features.models','분석 모델 확장')}</span></li>
                  </ul>
                  <div className="mt-auto pt-6">
                    <a href="/support" className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">{t('pro.cta','문의하기')}</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Enterprise */}
            <div className="w-full">
              <div className="relative h-full rounded-2xl bg-gradient-to-br from-slate-400/25 via-blue-300/20 to-slate-300/25 p-[1px]">
                <div className="rounded-2xl bg-gradient-to-br from-white/90 via-blue-50/85 to-slate-50/85 backdrop-blur-sm ring-1 ring-blue-200/60 p-6 md:p-8 shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full">
                  <div className="mb-1 text-xs font-semibold tracking-wide text-blue-700">{t('enterprise.badge','Enterprise')}</div>
                  <h3 className="text-xl font-semibold text-slate-900">{t('enterprise.title','엔터프라이즈')}</h3>
                  <p className="mt-1 text-sm text-slate-600">{t('enterprise.subtitle','보안·확장성·전담 지원이 필요한 기업을 위해.')}</p>
                  {/* 가격 슬롯(금액 비노출) */}
                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">{t('enterprise.price','맞춤 견적')}</span>
                    <span className="text-sm text-slate-500">{t('enterprise.per','/ 월')}</span>
                  </div>
                  <div className="mt-5 h-px w-full bg-slate-200" />
                  <ul className="mt-5 space-y-3.5 text-base text-slate-700">
                    <li className="flex items-center gap-3"><Check className="text-blue-600" size={12} /> <span>{t('enterprise.features.sso','SSO / SAML 지원')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-blue-600" size={12} /> <span>{t('enterprise.features.infra','전용 인프라 및 리전 선택')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-blue-600" size={12} /> <span>{t('enterprise.features.sla','SLA / 전담 기술 지원')}</span></li>
                    <li className="flex items-center gap-3"><Check className="text-blue-600" size={12} /> <span>{t('enterprise.features.audit','보안·감사 로그 제공')}</span></li>
                  </ul>
                  <div className="mt-auto pt-6">
                    <a href="/support" className="inline-flex w-full items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600">{t('enterprise.cta','컨택트')}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Post-plan narrative */}
          <div className="mt-14 rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-indigo-50 px-6 py-10 shadow-inner md:px-10 md:py-12">
            <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
              <div>
                <h3 className="text-xl md:text-2xl font-semibold text-slate-900">
                  {t('postPlans.headline', '플랜 간 이동은 클릭 한 번, 데이터는 그대로 유지')}
                </h3>
                <p className="mt-4 text-sm md:text-base text-slate-600">
                  {t('postPlans.copy', '요금제는 언제든지 업그레이드 혹은 다운그레이드할 수 있으며, 저장된 분석과 웹훅 구성은 유지됩니다. PoC부터 전면 도입까지 유연하게 설계했습니다.')}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-indigo-100/70">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">{t('postPlans.metrics.label', '추천 플로우')}</p>
                <div className="mt-3 space-y-3 text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">1</span>
                    <p>{t('postPlans.metrics.step1', 'Free -> 토큰 소진 패턴과 팀 협업 방식 검증')}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">2</span>
                    <p>{t('postPlans.metrics.step2', 'Pro -> 실서비스 알람/모니터링 연동으로 운영 지표 축적')}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">3</span>
                    <p>{t('postPlans.metrics.step3', 'Enterprise -> 글로벌 리전, 맞춤 SLA, 커스텀 워크플로 적용')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footnote */}
          <div className="mt-10 space-y-2 text-center text-xs text-slate-500">
            <p>{t('footnote.disclaimer1', '표시된 금액은 예시이며, 실제 가격은 지역, 사용량, 계약 기간에 따라 달라질 수 있습니다.')}</p>
            <p>{t('footnote.disclaimer2', 'Enterprise 고객은 온보딩 단계에서 보안 점검과 데이터 거버넌스 컨설팅이 제공됩니다.')}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
