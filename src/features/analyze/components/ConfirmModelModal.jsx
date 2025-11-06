import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

export default function ConfirmModelModal({ open, model, onConfirm, onCancel }) {
  const { t, i18n } = useTranslation('common');

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel?.();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onCancel]);

  const spec = useMemo(() => detectSpecialization(model), [model]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[210]">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px]"
        onClick={onCancel}
      />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="relative w-full max-w-md overflow-hidden rounded-2xl border bg-white text-slate-900 shadow-xl ring-1 ring-slate-200 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-100 dark:ring-slate-700"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label={t('confirmModelModal.close', '닫기')}
            onClick={onCancel}
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <div className="px-6 pt-8 pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700 dark:text-indigo-300/90">
              {t('confirmModelModal.title', '모델 확인')}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
              {model?.name || t('confirmModelModal.unknownModel', '선택한 모델')}
            </h3>

            <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {spec === 'person' ? (
                <>
                  <p>{t('confirmModelModal.person.line1', '지금 선택하신 모델은 인물에 특화된 모델이에요.')}</p>
                  <p>
                    {t('confirmModelModal.person.line2', '올려주신 이미지가 인물이 포함되어 있나요? 만약 아니라면 예측 결과의 정확성을 보장할 수 없어요.')}
                  </p>
                  <p>{t('confirmModelModal.person.line3', '맞다면 계속 진행할게요.')}</p>
                </>
              ) : (
                <>
                  <p>
                    {t('confirmModelModal.generic.line1', '지금 선택하신 모델은 {{model}} 모델이에요.', {
                      model: model?.name || ''
                    })}
                  </p>
                  {(() => {
                    const lang = i18n?.resolvedLanguage || i18n?.language;
                    const base = typeof lang === 'string' ? lang.split('-')[0] : undefined;
                    const map = model?.descriptions || {};
                    const desc = (lang && map[lang]) || (base && map[base]) || model?.description;
                    return desc ? (
                    <p className="text-slate-500 dark:text-slate-400">
                      {t('confirmModelModal.generic.desc', '설명: {{desc}}', { desc: desc })}
                    </p>
                    ) : null;
                  })()}
                  <p>
                    {t('confirmModelModal.generic.line2', '업로드한 이미지와 분석 목적에 적합한 모델인지 확인해 주세요. 맞다면 계속 진행할게요.')}
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800/80"
              >
                {t('confirmModelModal.cancel', '취소')}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-400 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_36px_-22px_rgba(59,130,246,0.55)] transition active:scale-[0.99]"
              >
                {t('confirmModelModal.proceed', '계속 진행')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function detectSpecialization(model) {
  if (!model) return 'generic';
  const descs = [];
  if (model.description) descs.push(String(model.description));
  if (model.descriptions && typeof model.descriptions === 'object') {
    try {
      descs.push(...Object.values(model.descriptions).map((v) => String(v || '')));
    } catch {}
  }
  const hay = `${model.name || ''} ${descs.join(' ')}`.toLowerCase();
  const koHay = `${model.name || ''} ${descs.join(' ')}`;
  const personHints = [
    'face', 'person', 'people', 'human',
    '인물', '얼굴', '사람'
  ];
  if (personHints.some((kw) => hay.includes(kw) || koHay.includes(kw))) {
    return 'person';
  }
  return 'generic';
}
