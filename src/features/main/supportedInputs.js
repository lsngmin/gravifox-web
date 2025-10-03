import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SupportedInputs() {
  const { t } = useTranslation('home');
  const badges = [
    t('supported.badges.mp4', 'MP4'),
    t('supported.badges.mov', 'MOV'),
    t('supported.badges.jpg', 'JPG'),
    t('supported.badges.png', 'PNG'),
    t('supported.badges.url', 'URL input'),
    t('supported.badges.maxLength', '<= 2 min'),
    t('supported.badges.maxRes', 'Up to 4K'),
  ];

  return (
    <section id="supported" className="relative isolate overflow-hidden py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.35),_transparent_65%)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-6 text-slate-100">
        <div className="mx-auto max-w-3xl text-center">
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300">
            {t('supported.eyebrow', '지원 가능한 입력')}
          </h3>
          <p className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {t('supported.title', '지원 형식과 제한 사항')}
          </p>
          <p className="mt-4 text-sm sm:text-base text-indigo-100/90">
            {t('supported.subtitle', '처음 써보는 분도 이해하기 쉬운 형식과 제한을 정리했어요.')}
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-5xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-3xl border border-indigo-400/30 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-indigo-200">
                {t('supported.cards.video.title', '동영상 검사')}
              </h4>
              <p className="mt-3 text-xs text-indigo-100/80">
                {t('supported.cards.video.subtitle', '짧은 클립부터 제품 데모까지 올리면 중요한 장면만 골라 빠르게 판별해요.')}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[badges[0], badges[1], badges[5]].map((label) => (
                  <span key={label} className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-100">
                    {label}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs text-indigo-100/70">
                {t('supported.cards.video.example', '예: mp4 또는 mov 제품 소개 영상, 2분 이하 짧은 광고')}
              </p>
            </article>

            <article className="rounded-3xl border border-indigo-400/30 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-indigo-200">
                {t('supported.cards.image.title', '이미지 검사')}
              </h4>
              <p className="mt-3 text-xs text-indigo-100/80">
                {t('supported.cards.image.subtitle', '사진 한 장만 올려도 얼굴, 조명, 질감 신호를 함께 살펴 진위를 알려드려요.')}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[badges[2], badges[3], badges[6]].map((label) => (
                  <span key={label} className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-100">
                    {label}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs text-indigo-100/70">
                {t('supported.cards.image.example', '예: jpg 혹은 png 인물 사진, 4K 이하 스크린샷')}
              </p>
            </article>

            <article className="rounded-3xl border border-indigo-400/30 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur lg:col-span-1 sm:col-span-2">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-indigo-200">
                {t('supported.cards.api.title', 'API와 스트리밍 연결')}
              </h4>
              <p className="mt-3 text-xs text-indigo-100/80">
                {t('supported.cards.api.subtitle', '링크를 보내거나 직접 업로드하면 서명 검증과 스트리밍 중계까지 자동으로 처리돼요.')}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[badges[4], t('supported.badges.signed', 'Signed URLs'), t('supported.badges.streaming', 'RTMP beta')].map((label) => (
                  <span key={label} className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-100">
                    {label}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs text-indigo-100/70">
                {t('supported.cards.api.example', '예: 보호된 URL, 사내 대시보드 업로드, RTMP 베타 스트림')}
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
