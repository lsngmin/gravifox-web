import React, { useCallback, useMemo, useState } from 'react';
import { Share2, Star, ArrowUpRight } from 'lucide-react';
import MobileReportDrawer from './MobileReportDrawer';
import usePreviewUrl from '../../../../utils/usePreviewUrl';
import { useThemeMode } from '../../../../app/hooks/useThemeMode';

const clamp01 = (value) => Math.max(0, Math.min(1, value));

function buildConfidenceCopy({ percent, t }) {
  if (percent == null) {
    return {
      headline: t?.('mobileAnalyze.report.confidence.pending', '생성 확률을 계산하는 중이에요.'),
      detail:
        t?.(
          'mobileAnalyze.report.confidence.pendingDetail',
          '분석이 마무리되면 가장 유력한 판단 기준을 바로 알려 드릴게요.'
        ) || '',
    };
  }
  if (percent >= 85) {
    return {
      headline: t?.('mobileAnalyze.report.confidence.ai.high', 'AI가 생성했을 가능성이 매우 높아요.'),
      detail:
        t?.(
          'mobileAnalyze.report.confidence.ai.highDetail',
          '공유하기 전에는 출처와 근거를 함께 보관해 두는 것이 좋아요.'
        ) || '',
    };
  }
  if (percent >= 60) {
    return {
      headline: t?.('mobileAnalyze.report.confidence.ai.mid', 'AI 생성 징후가 뚜렷하게 나타났어요.'),
      detail:
        t?.(
          'mobileAnalyze.report.confidence.ai.midDetail',
          '세부 항목을 살펴보며 추가 근거를 확보하면 판단에 도움이 돼요.'
        ) || '',
    };
  }
  if (percent >= 40) {
    return {
      headline: t?.('mobileAnalyze.report.confidence.mixed', '실제와 합성 신호가 비슷하게 감지됐어요.'),
      detail:
        t?.(
          'mobileAnalyze.report.confidence.mixedDetail',
          '다른 자료와 함께 교차 확인하면 더 정확한 결론을 얻을 수 있어요.'
        ) || '',
    };
  }
  return {
    headline: t?.('mobileAnalyze.report.confidence.real.high', '실제 사진일 가능성이 높아요'),
    detail:
      t?.(
        'mobileAnalyze.report.confidence.real.highDetail',
        'AI 생성으로 판단된 흔적이 거의 없어요.'
      ) || '',
  };
}

export default function MobileAnalysisReport({ report, t }) {
  const { themeMode } = useThemeMode();
  const isDark = themeMode === 'dark';
  const reportData = useMemo(() => report?.result || {}, [report?.result]);
  const fileName = report?.fileMeta?.name || '';
  const previewUrl = usePreviewUrl(report?.fileMeta);
  const rawLabel = reportData.label || reportData.decision || 'UNKNOWN';
  const label = typeof rawLabel === 'string' ? rawLabel.toUpperCase() : 'UNKNOWN';

  const labelCopy = useMemo(() => {
    if (label === 'REAL') return t?.('mobileAnalyze.report.labels.real', 'REAL');
    if (label === 'FAKE') return t?.('mobileAnalyze.report.labels.fake', 'FAKE');
    if (label === 'UNKNOWN') return t?.('mobileAnalyze.report.labels.unknown', 'UNKNOWN');
    return label || 'UNKNOWN';
  }, [label, t]);

  const labelTone = useMemo(() => {
    if (label === 'REAL') {
      return {
        badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-300/50 dark:bg-emerald-500/20 dark:text-emerald-50',
        dot: 'bg-emerald-500 dark:bg-emerald-300',
      };
    }
    if (label === 'FAKE') {
      return {
        badge: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/55 dark:bg-[rgba(80,7,36,0.62)] dark:text-rose-100',
        dot: 'bg-rose-500 dark:bg-rose-200',
      };
    }
    return {
      badge: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-300/40 dark:bg-amber-500/18 dark:text-amber-100',
      dot: 'bg-amber-500 dark:bg-amber-300',
    };
  }, [label]);

  const probFake =
    typeof reportData.prob_fake === 'number'
      ? reportData.prob_fake
      : typeof reportData.pAi === 'number'
      ? reportData.pAi
      : null;
  const probReal =
    typeof reportData.prob_real === 'number'
      ? reportData.prob_real
      : typeof reportData.pReal === 'number'
      ? reportData.pReal
      : null;
  const confidence = typeof reportData.confidence === 'number' ? reportData.confidence : null;

  const aiProbability = useMemo(() => {
    if (typeof probFake === 'number') return clamp01(probFake);
    if (Array.isArray(reportData?.probabilities) && reportData.probabilities.length >= 2) {
      const aiProb = reportData.probabilities[1];
      if (typeof aiProb === 'number' && !Number.isNaN(aiProb)) return clamp01(aiProb);
      const realProb = reportData.probabilities[0];
      if (typeof realProb === 'number' && !Number.isNaN(realProb)) return clamp01(1 - realProb);
    }
    if (typeof reportData?.pAi === 'number') return clamp01(reportData.pAi);
    if (typeof reportData?.p_ai === 'number') return clamp01(reportData.p_ai);
    if (typeof reportData?.ai_prob === 'number') return clamp01(reportData.ai_prob);
    if (typeof probReal === 'number') return clamp01(1 - probReal);
    if (typeof reportData?.pReal === 'number') return clamp01(1 - reportData.pReal);
    if (typeof confidence === 'number') {
      return clamp01(label === 'FAKE' ? confidence : 1 - confidence);
    }
    return null;
  }, [reportData, probFake, probReal, confidence, label]);

  const confidencePercent =
    aiProbability == null || Number.isNaN(aiProbability)
      ? null
      : Math.round(clamp01(aiProbability) * 100);

  const { headline: rawHeadline, detail } = useMemo(
    () => buildConfidenceCopy({ percent: confidencePercent, t }),
    [confidencePercent, t]
  );

  const headline = useMemo(() => {
    if (typeof rawHeadline !== 'string') return rawHeadline;
    return rawHeadline.replace(/\.\s*$/, '');
  }, [rawHeadline]);

  const [bookmarked, setBookmarked] = useState(false);
  const handleToggleBookmark = useCallback(() => {
    setBookmarked((prev) => !prev);
  }, []);

  const handleShare = useCallback(async () => {
    const isClient = typeof window !== 'undefined';
    const nav = typeof navigator !== 'undefined' ? navigator : null;
    const shareUrl = isClient ? window.location.href : '';
    const shareTitle =
      fileName || t?.('mobileAnalyze.report.share.title', '분석 결과를 확인해 보세요');
    const shareText = headline;
    try {
      if (nav?.share) {
        await nav.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      }
      if (nav?.clipboard?.writeText) {
        await nav.clipboard.writeText(shareUrl);
        if (isClient && typeof window.alert === 'function') {
          window.alert(
            t?.('mobileAnalyze.report.share.copied', '링크가 복사됐어요.')
          );
        }
        return;
      }
      throw new Error('share-unavailable');
    } catch (error) {
      if (isClient && typeof window.alert === 'function') {
        window.alert(
          t?.(
            'mobileAnalyze.report.share.failed',
            '공유 기능을 사용할 수 없어요. 링크를 직접 복사해 주세요.'
          )
        );
      }
    }
  }, [headline, fileName, t]);

  const generationLabel = t?.('mobileAnalyze.report.metrics.generationProbability', '생성 확률');
  const detailLabel = t?.('mobileAnalyze.report.actions.viewDetail', '세부 리포트 보기');
  const percentDisplay = confidencePercent != null ? `${confidencePercent}%` : '—';

  const [modalOpen, setModalOpen] = useState(false);
  const reportContainerClass = `relative overflow-hidden rounded-[28px] p-4 shadow-sm ring-1 ${
    isDark
      ? 'ring-transparent bg-slate-950/85 text-slate-100 shadow-[0_30px_60px_-32px_rgba(15,23,42,0.88)] backdrop-blur'
      : 'ring-slate-200 bg-white text-slate-900'
  }`;
  const previewWrapperClass = `mt-0.5 mb-0.5 overflow-hidden rounded-3xl border ${
    isDark ? 'border-white/10 bg-black/40' : 'border-slate-200 bg-slate-50'
  }`;
  const detailButtonClass = `inline-flex h-9 items-center gap-2.5 rounded-full border px-4 text-[11px] font-semibold uppercase tracking-[0.2em] ${
    isDark
      ? 'border-emerald-300/30 bg-emerald-400/22 text-emerald-50 shadow-[0_22px_34px_-22px_rgba(16,185,129,0.45)] hover:bg-emerald-400/26'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm hover:bg-emerald-100'
  } transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/80`;
  const iconButtonClass = `inline-flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 ${
    isDark
      ? 'bg-white/12 text-slate-100 shadow-[0_10px_18px_-16px_rgba(148,163,184,0.55)] hover:bg-white/18'
      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
  }`;
  const generationBadgeClass = `ml-auto inline-flex items-center justify-center rounded-full border px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] ${
    isDark
      ? 'border-[rgba(99,102,241,0.35)] bg-[linear-gradient(140deg,rgba(99,102,241,0.22),rgba(129,140,248,0.1),rgba(99,102,241,0.18))] text-slate-100 shadow-[0_16px_36px_-28px_rgba(30,64,175,0.48),0_10px_28px_-22px_rgba(99,102,241,0.38),0_0_14px_rgba(129,140,248,0.22)]'
      : 'border-slate-200 bg-slate-50 text-slate-700 shadow-sm'
  } backdrop-blur-xl`;

  return (
    <>
      <section className={reportContainerClass}>
        <div className={`pointer-events-none absolute -left-24 top-[-36px] h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl ${isDark ? '' : 'hidden'}`} aria-hidden="true" />
        <div className={`pointer-events-none absolute right-[-28px] bottom-[-48px] h-48 w-48 rounded-full bg-sky-400/12 blur-3xl ${isDark ? '' : 'hidden'}`} aria-hidden="true" />
        <div className="relative flex flex-col gap-2.5">
          <div className="flex w-full flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${labelTone.badge}`}>
              <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${labelTone.dot}`} />
              {labelCopy}
            </span>
            <span className={generationBadgeClass}>
              {generationLabel} {percentDisplay}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-[1.35rem] font-semibold leading-tight text-slate-900 dark:text-white">{headline}</h2>
            {detail && <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-200/85">{detail}</p>}
          </div>
        {previewUrl && (
          <div className={previewWrapperClass}>
            <img
              src={previewUrl}
              alt={fileName ? `${fileName} 미리보기` : t?.('mobileAnalyze.report.previewUploadAlt', '업로드 미디어 미리보기')}
              className="h-[17rem] w-full object-cover"
              loading="lazy"
            />
          </div>
        )}
          <div className="flex items-center justify-between gap-2.5 pt-0.5">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className={detailButtonClass}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              {detailLabel}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className={iconButtonClass}
                aria-label={t?.('mobileAnalyze.report.actions.share', '결과 링크 공유하기')}
                title={t?.('mobileAnalyze.report.actions.share', '결과 링크 공유하기')}
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleToggleBookmark}
                className={iconButtonClass}
                aria-label={t?.('mobileAnalyze.report.actions.bookmark', '즐겨찾기에 추가')}
                title={t?.('mobileAnalyze.report.actions.bookmark', '즐겨찾기에 추가')}
              >
                <Star className={`h-4 w-4 ${bookmarked ? 'fill-amber-300 stroke-current' : 'fill-none stroke-current'}`} />
              </button>
            </div>
          </div>
        </div>
      </section>
      <MobileReportDrawer
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        data={report?.result}
        mediaMeta={report?.fileMeta}
        jobId={report?.jobId}
      />
    </>
  );
}
