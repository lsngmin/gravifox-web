import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import { ArrowPathIcon, StarIcon } from "@heroicons/react/24/outline";
import AnalysisReport from "../../analyze/components/report/AnalysisReport";
import { persistPreviewForJob } from "../../../utils/previewStore";
import usePreviewUrl from "../../../utils/usePreviewUrl";
import MobileReportDrawer from "../../analyze/components/mobile/MobileReportDrawer";
import { ANALYZE_ENDPOINTS, FASTAPI_ENDPOINTS } from "../../../api/endPointRoute";
import axios from "../../../api/http";
import ensureUploadToken from "../../analyze/api/uploadTokenClient";
import { Transition } from '@headlessui/react';
import { buildStoredFailure, buildStoredReport } from "../../../utils/reportStorage";
import { AnalysisReportAPI } from "../api/dashboardAPI";
import { normalizeAnalysisResult } from "../../analyze/utils/normalizeResult";

const PAGE_SIZE = 12;
const DEFAULT_THRESHOLD = 0.5;

const clamp01 = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
};

const parseJsonSafe = (raw) => {
  if (!raw) return null;
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
};

const toTimestamp = (value) => {
  if (!value) return null;
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : null;
};

const toClientLabel = (value) => {
  if (!value) return 'UNKNOWN';
  const upper = String(value).toUpperCase();
  if (upper === 'AI') return 'FAKE';
  if (upper === 'FAKE' || upper === 'REAL' || upper === 'UNKNOWN') return upper;
  return 'UNKNOWN';
};

const deriveMetaFromDetail = (detail, normalized) => {
  if (!detail) return null;
  const mediaType = typeof detail.mediaType === 'string' ? detail.mediaType.toLowerCase() : null;

  const candidateMetas = [
    normalized?.mediaMeta,
    normalized?.meta,
    normalized?.file,
    normalized?.media,
  ].filter((meta) => meta && typeof meta === 'object');
  const resolvedMeta = candidateMetas[0] || {};
  const resolvedName =
    resolvedMeta.name ||
    normalized?.name ||
    normalized?.params?.fileName ||
    detail.uploadId ||
    'media';
  const resolvedType =
    resolvedMeta.type ||
    normalized?.params?.fileType ||
    (mediaType ? `${mediaType}/unknown` : null);
  const resolvedSize =
    typeof resolvedMeta.size === 'number'
      ? resolvedMeta.size
      : typeof normalized?.params?.fileSize === 'number'
        ? normalized.params.fileSize
        : null;

  return {
    name: resolvedName,
    type: resolvedType,
    size: resolvedSize,
    uploadId: detail.uploadId,
    mediaType,
  };
};

const normalizeDetailRecord = (detail) => {
  if (!detail || !detail.uploadId) return null;
  const parsed = parseJsonSafe(detail.metaJson) || {};
  const normalized = normalizeAnalysisResult(parsed);
  const label = toClientLabel(normalized?.label || detail.label);
  normalized.label = label;
  if (!normalized.modelVersion && detail.modelVersion) {
    normalized.modelVersion = detail.modelVersion;
  }
  const detailScoreRaw = typeof detail.score === 'number' ? detail.score : Number(detail.score);
  const detailScore = clamp01(detailScoreRaw);
  if (typeof normalized.prob_fake !== 'number' && detailScore !== null) {
    normalized.prob_fake = label === 'REAL' ? clamp01(1 - detailScore) : detailScore;
  }
  if (typeof normalized.threshold !== 'number') {
    normalized.threshold = DEFAULT_THRESHOLD;
  }
  const meta = deriveMetaFromDetail(detail, normalized);
  return {
    jobId: detail.uploadId,
    data: normalized,
    meta,
    storedAt: toTimestamp(detail.updatedAt || detail.createdAt),
  };
};

const buildSummaryFallback = (item) => {
  if (!item || !item.uploadId) return null;
  const label = toClientLabel(item.label);
  const scoreValue = typeof item.score === 'number' ? item.score : Number(item.score);
  const normalizedScore = clamp01(scoreValue);
  let probFake = null;
  if (typeof normalizedScore === 'number') {
    probFake = label === 'REAL' ? clamp01(1 - normalizedScore) : normalizedScore;
  }
  return {
    jobId: item.uploadId,
    data: {
      label,
      prob_fake: typeof probFake === 'number' ? probFake : null,
      threshold: DEFAULT_THRESHOLD,
      modelVersion: item?.modelVersion || null,
    },
    meta: {
      name: item.uploadId,
      type: item.mediaType ? `${item.mediaType}/unknown` : null,
      size: null,
      uploadId: item.uploadId,
      mediaType: item.mediaType,
    },
    storedAt: toTimestamp(item.createdAt),
  };
};

export default function AnalysisHistoryList() {
  const { t } = useTranslation('dashboard');
  const { fetchReports, fetchReportDetail } = AnalysisReportAPI();
  const [pageData, setPageData] = useState({ items: [], page: 0, size: PAGE_SIZE, totalPages: 0, totalElements: 0 });
  const [detailCache, setDetailCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const search = "";
  const [labelTab, setLabelTab] = useState("ALL"); // ALL | REAL | FAKE | UNKNOWN
  const [favOnly, setFavOnly] = useState(false);
  const [favs, setFavs] = useState(() => {
    try {
      const raw = localStorage.getItem('dashboard:favorites');
      const a = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(a) ? a : []);
    } catch { return new Set(); }
  });
  const [sortKey, setSortKey] = useState('NEWEST'); // NEWEST | OLDEST | LABEL | NAME_ASC | NAME_DESC | SIZE_ASC | SIZE_DESC
  const [openRe, setOpenRe] = useState(() => new Set());
  const [drawerReport, setDrawerReport] = useState(null);

  const loadReports = useCallback(async ({ resetDetails = false } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchReports({ page: 0, size: PAGE_SIZE });
      const items = Array.isArray(response?.items) ? response.items : [];
      setPageData({
        items,
        page: typeof response?.page === 'number' ? response.page : 0,
        size: typeof response?.size === 'number' ? response.size : PAGE_SIZE,
        totalPages: typeof response?.totalPages === 'number' ? response.totalPages : 0,
        totalElements: typeof response?.totalElements === 'number' ? response.totalElements : items.length,
      });
      setDetailCache((prev) => {
        if (resetDetails) {
          return {};
        }
        if (!items.length) {
          return {};
        }
        const keep = new Set(items.map((item) => item?.uploadId).filter(Boolean));
        const next = {};
        keep.forEach((id) => {
          if (Object.prototype.hasOwnProperty.call(prev, id)) {
            next[id] = prev[id];
          }
        });
        return next;
      });
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || '분석 기록을 불러오지 못했어요.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fetchReports]);

  const handleRefresh = useCallback(() => {
    loadReports({ resetDetails: true });
  }, [loadReports]);

  useEffect(() => {
    loadReports({ resetDetails: true });
  }, [loadReports]);

  const missingUploadIds = useMemo(() => {
    if (!Array.isArray(pageData.items) || pageData.items.length === 0) return [];
    return pageData.items
      .map((item) => item?.uploadId)
      .filter((uploadId) => uploadId && !Object.prototype.hasOwnProperty.call(detailCache, uploadId));
  }, [pageData.items, detailCache]);

  useEffect(() => {
    if (!missingUploadIds.length) return;
    let cancelled = false;
    (async () => {
      const results = await Promise.allSettled(missingUploadIds.map((uploadId) => fetchReportDetail(uploadId)));
      if (cancelled) return;
      setDetailCache((prev) => {
        const next = { ...prev };
        missingUploadIds.forEach((uploadId, idx) => {
          const res = results[idx];
          if (res?.status === 'fulfilled' && res.value) {
            const normalized = normalizeDetailRecord(res.value);
            if (normalized) {
              next[uploadId] = normalized;
            }
          } else if (!Object.prototype.hasOwnProperty.call(next, uploadId)) {
            next[uploadId] = null;
          }
        });
        return next;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [missingUploadIds, fetchReportDetail]);

  const items = useMemo(() => {
    const source = Array.isArray(pageData.items) ? pageData.items : [];
    return source
      .map((item) => {
        const cached = detailCache[item.uploadId];
        return cached || buildSummaryFallback(item);
      })
      .filter(Boolean);
  }, [pageData.items, detailCache]);

  const computeLabel = (d) => {
    const L = d?.label;
    if (L) return String(L).toUpperCase();
    if (typeof d?.prob_fake === 'number' && typeof d?.threshold === 'number') {
      return d.prob_fake >= d.threshold ? 'FAKE' : 'REAL';
    }
    return 'UNKNOWN';
  };

  const saveFavs = (nextSet) => {
    setFavs(nextSet);
    try { localStorage.setItem('dashboard:favorites', JSON.stringify(Array.from(nextSet))); } catch {}
  };

  const toggleFav = (jobId) => {
    const next = new Set(favs);
    if (next.has(jobId)) next.delete(jobId); else next.add(jobId);
    saveFavs(next);
  };

  // seen map (first-seen timestamps) for sorting
  const getSeenMap = () => {
    try { return JSON.parse(localStorage.getItem('dashboard:seen') || '{}') || {}; } catch { return {}; }
  };
  const setSeenMap = (m) => {
    try { localStorage.setItem('dashboard:seen', JSON.stringify(m)); } catch {}
  };

  const filtered = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    const seen = getSeenMap();
    const list = items.filter(({ jobId, data, meta }) => {
      const L = computeLabel(data);
      if (labelTab !== 'ALL' && L !== labelTab) return false;
      if (favOnly && !favs.has(jobId)) return false;
      if (q) {
        const name = (meta?.name || '').toLowerCase();
        if (!name.includes(q)) return false;
      }
      return true;
    }).map((it) => {
      const L = computeLabel(it.data);
      const name = it.meta?.name || '';
      let seenAt = seen[it.jobId];
      if (!seenAt) {
        seenAt = Date.now();
        seen[it.jobId] = seenAt;
        setSeenMap(seen);
      }
      return { ...it, _label: L, _name: name, _seenAt: seenAt };
    });
    const labelOrder = { FAKE: 0, REAL: 1, UNKNOWN: 2 };
    list.sort((a, b) => {
      if (sortKey === 'NEWEST') return b._seenAt - a._seenAt;
      if (sortKey === 'OLDEST') return a._seenAt - b._seenAt;
      if (sortKey === 'LABEL') return (labelOrder[a._label] ?? 9) - (labelOrder[b._label] ?? 9) || a._name.localeCompare(b._name);
      if (sortKey === 'NAME_ASC') return a._name.localeCompare(b._name);
      if (sortKey === 'NAME_DESC') return b._name.localeCompare(a._name);
      if (sortKey === 'SIZE_ASC') return (a.meta?.size || 0) - (b.meta?.size || 0);
      if (sortKey === 'SIZE_DESC') return (b.meta?.size || 0) - (a.meta?.size || 0);
      return 0;
    });
    return list;
  }, [items, search, labelTab, favOnly, favs, sortKey]);

  const averageProb = useMemo(() => {
    if (!filtered.length) return null;
    let sum = 0;
    let count = 0;
    filtered.forEach(({ data }) => {
      const prob = typeof data?.prob_fake === 'number' ? data.prob_fake : NaN;
      if (Number.isFinite(prob)) {
        sum += prob;
        count += 1;
      }
    });
    if (!count) return null;
    return (sum / count) * 100;
  }, [filtered]);

  const hasTopStats = filtered.length > 0 || averageProb !== null;
  const showCallout = loading || error || items.length > 0;
  const calloutTitle = loading
    ? t('callout.loadingTitle', { defaultValue: '최근 분석 데이터를 불러오는 중이에요' })
    : error
      ? t('callout.errorTitle', { defaultValue: '분석 데이터를 불러오지 못했어요.' })
      : t('callout.readyTitle', { defaultValue: '최근 분석 데이터를 확인해 보세요' });
  const calloutHint = loading
    ? t('callout.loadingHint', { defaultValue: '결과가 보이지 않는다면 오른쪽 새로고침을 눌러주세요.' })
    : error
      ? t('callout.errorHint', { defaultValue: '새로고침을 눌러 다시 시도해 주세요.' })
      : t('callout.refreshHint', { defaultValue: '결과가 보이지 않는다면 오른쪽 새로고침을 눌러주세요.' });

  return (
    <div className="mt-4 space-y-3">
      {hasTopStats && (
        <div className="space-y-1.5">
          {filtered.length > 0 && (
            <p className="text-xl font-semibold text-slate-900 dark:text-slate-200 sm:text-2xl">
              {t('summary.weeklyCount', { count: filtered.length, defaultValue: `지난 일주일 동안 총 ${filtered.length}건의 분석 결과가 있어요` })}
            </p>
          )}
          {averageProb !== null && (
            <p className="text-sm text-slate-600 dark:text-slate-500 sm:text-base">
              {t('summary.averageProb', { value: averageProb.toFixed(1), defaultValue: `사용자님이 업로드한 이미지의 평균 생성 확률은 ${averageProb.toFixed(1)}%예요.` })}
            </p>
          )}
        </div>
      )}
      {showCallout && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-xs text-indigo-700 shadow-sm backdrop-blur dark:border-indigo-500/35 dark:bg-slate-900/75 dark:text-indigo-100 dark:shadow-lg dark:shadow-indigo-900/35">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-100">{calloutTitle}</p>
              <p className="text-xs leading-relaxed text-indigo-600 dark:text-indigo-200/85">
                {error || calloutHint}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-full border border-indigo-300 bg-indigo-100 text-indigo-800 transition hover:bg-indigo-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300 disabled:cursor-not-allowed disabled:opacity-60 dark:border-indigo-400/40 dark:bg-indigo-500/25 dark:text-indigo-100 dark:hover:bg-indigo-500/35"
              aria-label={t('toolbar.refreshAria', { defaultValue: '최근 분석 새로고침' })}
            >
              <ArrowPathIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
      {/* Filters */}
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setFavOnly((prev) => !prev)}
          className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[13px] font-semibold transition ${
            favOnly ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <StarIcon className="h-4 w-4" aria-hidden="true" />
          {t('filters.favoritesOnly', { defaultValue: '즐겨찾기만' })}
        </button>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-600 dark:bg-slate-800">
          {['ALL','REAL','FAKE','UNKNOWN'].map(L => (
            <button
              key={L}
              onClick={() => setLabelTab(L)}
              className={`rounded-md px-3 py-1.5 text-[13px] font-semibold ${labelTab===L ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700'}`}
            >{L}</button>
          ))}
        </div>
          <div className="hidden items-center gap-1 text-xs text-slate-500 sm:flex">
            <span className="text-slate-400">{t('filters.sortLabel', { defaultValue: '정렬' })}</span>
            <select
              className="rounded border border-slate-200 bg-white px-1.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              value={sortKey}
              onChange={(e)=>setSortKey(e.target.value)}
            >
              <option value="NEWEST">{t('filters.sort.NEWEST', { defaultValue: '최신순' })}</option>
              <option value="OLDEST">{t('filters.sort.OLDEST', { defaultValue: '오래된순' })}</option>
              <option value="LABEL">{t('filters.sort.LABEL', { defaultValue: '레이블' })}</option>
              <option value="NAME_ASC">{t('filters.sort.NAME_ASC', { defaultValue: '파일명 A→Z' })}</option>
              <option value="NAME_DESC">{t('filters.sort.NAME_DESC', { defaultValue: '파일명 Z→A' })}</option>
              <option value="SIZE_ASC">{t('filters.sort.SIZE_ASC', { defaultValue: '파일 크기 ↑' })}</option>
              <option value="SIZE_DESC">{t('filters.sort.SIZE_DESC', { defaultValue: '파일 크기 ↓' })}</option>
            </select>
          </div>
        </div>
      </div>

      {!loading && !error && items.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {t('empty.noHistory', { defaultValue: '분석 기록이 없어요. Analyze에서 파일을 업로드해 보세요.' })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map(({ jobId, data, meta }) => (
          <HistoryCard
            key={jobId}
            jobId={jobId}
            data={data}
            meta={meta}
            computeLabel={computeLabel}
            favs={favs}
            onToggleFav={toggleFav}
            onOpenReport={() => setDrawerReport({ jobId, data, meta })}
            isReOpen={openRe.has(jobId)}
            onToggleRe={() => {
              const next = new Set(openRe);
              if (next.has(jobId)) next.delete(jobId); else next.add(jobId);
              setOpenRe(next);
            }}
            onReanalyzeFinish={handleRefresh}
          />
        ))}
      </div>

      <MobileReportDrawer
        open={!!drawerReport}
        onClose={() => setDrawerReport(null)}
        data={drawerReport?.data}
        mediaMeta={drawerReport?.meta}
        jobId={drawerReport?.jobId}
      />
    </div>
  );
}

function HistoryCard({
  jobId,
  data,
  meta,
  computeLabel,
  favs,
  onToggleFav,
  onOpenReport,
  isReOpen,
  onToggleRe,
  onReanalyzeFinish,
}) {
  const { t } = useTranslation('dashboard');
  const previewUrl = usePreviewUrl(meta);
  const label = computeLabel(data);
  const probValue = typeof data?.prob_fake === 'number' ? (data.prob_fake * 100).toFixed(1) : null;
  const prob = probValue !== null ? `${probValue}%` : '-';
  const labelText = String(label).toUpperCase();
  const labelTone = labelText === 'FAKE'
    ? {
        wrapper: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/55 dark:bg-rose-500/20 dark:text-rose-100',
        dot: 'bg-rose-500 dark:bg-rose-300',
      }
    : labelText === 'REAL'
      ? {
          wrapper: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/55 dark:bg-emerald-500/20 dark:text-emerald-100',
          dot: 'bg-emerald-500 dark:bg-emerald-300',
        }
      : {
          wrapper: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/55 dark:bg-amber-500/20 dark:text-amber-100',
          dot: 'bg-amber-500 dark:bg-amber-300',
        };
  const mediaKind = typeof meta?.type === 'string' ? meta.type.split('/')[0] : null;
  const previewFallbackText = mediaKind === 'video' ? 'VIDEO' : mediaKind === 'audio' ? 'AUDIO' : mediaKind === 'image' ? 'IMAGE' : 'MEDIA';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700/40 dark:bg-slate-950/70 dark:shadow-lg dark:shadow-slate-900/40">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/40 via-transparent to-slate-200/60 dark:from-indigo-500/10 dark:to-slate-900/60" aria-hidden="true" />
      <div className="relative space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1 text-[12px] font-semibold text-indigo-700 dark:border-indigo-400/50 dark:bg-indigo-500/20 dark:text-indigo-100">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-400 dark:bg-indigo-200/90" />
              {t('card.genProb', { defaultValue: '생성 확률' })}
              <span className="text-indigo-900 dark:text-white">{prob}</span>
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.18em] ${labelTone.wrapper}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${labelTone.dot}`} />
              {labelText}
            </span>
          </div>
        </div>
        <p className="truncate text-right text-xs font-medium text-slate-500 dark:text-slate-300 sm:text-sm">{meta?.name || t('card.noFilename', { defaultValue: '파일명 없음' })}</p>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700/35 dark:bg-slate-900/80">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={meta?.name ? t('card.previewAlt', { name: meta.name, defaultValue: `${meta?.name} 미리보기` }) : t('card.previewAltFallback', { defaultValue: '업로드 미디어 미리보기' })}
              className="h-52 w-full object-cover sm:h-64"
              loading="lazy"
            />
          ) : (
            <div className="flex h-52 w-full items-center justify-center bg-slate-100 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-900/70 dark:text-slate-400 sm:h-64">
              {previewFallbackText}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleFav(jobId)}
              title={favs.has(jobId) ? t('card.unfavorite', { defaultValue: '즐겨찾기 해제' }) : t('card.favorite', { defaultValue: '즐겨찾기' })}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600 transition hover:bg-amber-100 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20"
            >
              {favs.has(jobId) ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
                  <path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.168L12 18.896l-7.336 3.87 1.402-8.168L.132 9.211l8.2-1.193L12 .587z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" />
                </svg>
              )}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenReport}
              className="inline-flex items-center rounded-lg bg-indigo-500/80 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
            >
              {t('card.viewReport', { defaultValue: '리포트 보기' })}
            </button>
            <button
              type="button"
              onClick={onToggleRe}
              className="inline-flex items-center rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-400/40 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:bg-indigo-500/20"
            >
              {isReOpen ? t('card.reanalyzeClose', { defaultValue: '재분석 닫기' }) : t('card.reanalyze', { defaultValue: '재분석' })}
            </button>
          </div>
        </div>
      </div>
      <Transition
        show={isReOpen}
        enter="transition-all duration-300 ease-out"
        enterFrom="opacity-0 -translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition-all duration-200 ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-1"
      >
        <div className="mt-3 rounded-2xl border border-slate-800/60 bg-slate-950/70 p-3">
          <ReAnalyzePane onFinish={onReanalyzeFinish} />
        </div>
      </Transition>
    </div>
  );
}

function ReAnalyzePane({ onFinish }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState(null);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [meta, setMeta] = useState(null);
  const esRef = useRef(null);

  useEffect(() => () => { try { esRef.current && esRef.current.close(); } catch {} }, []);

  const onStart = async () => {
    if (!file || submitting) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    setStage('UPLOAD');
    setProgress(null);
    try {
      // 1) upload
      let uploadId;
      let uploadToken;
      try {
        const tokenPayload = await ensureUploadToken(file);
        uploadId = tokenPayload?.uploadId;
        uploadToken = tokenPayload?.uploadToken;
        if (!uploadId || !uploadToken) throw new Error('업로드 토큰을 발급받지 못했어요.');
      } catch (issueErr) {
        const detail = issueErr?.response?.data;
        const status = issueErr?.response?.status;
        if (status === 401 || status === 403) {
          const err = new Error(detail?.message || detail?.error || '업로드 토큰 발급이 거부됐어요.');
          err.status = status;
          throw err;
        }
        throw new Error(detail?.message || detail?.error || issueErr?.message || '업로드 토큰을 발급받지 못했어요.');
      }

      const form = new FormData();
      form.append('file', file, file.name || 'media');
      form.append('uploadId', uploadId);
      const up = await fetch(FASTAPI_ENDPOINTS.UPLOAD, {
        method: 'POST',
        headers: { 'Upload-Token': uploadToken },
        body: form,
      });
      if (!up.ok) throw new Error('업로드에 실패했어요.');
      const upJson = await up.json();
      const resolvedUploadId = upJson?.uploadId || uploadId;
      if (!resolvedUploadId) throw new Error('uploadId를 확인하지 못했어요.');

      // 2) analyze create
      setStage('CREATE');
      let anJson;
      try {
        const anResp = await axios.post(ANALYZE_ENDPOINTS.CREATE, { uploadId: resolvedUploadId });
        anJson = anResp?.data;
      } catch (createErr) {
        const resp = createErr?.response;
        const detail = resp?.data;
        const status = resp?.status;
        const message = detail?.message || detail?.error || resp?.statusText || createErr?.message || '분석 생성에 실패했어요.';
        if (status === 401 || status === 403) {
          const err = new Error(message);
          err.status = status;
          throw err;
        }
        throw new Error(message);
      }
      const { jobId, sseToken } = anJson || {};
      if (!jobId || !sseToken) throw new Error('jobId 또는 sseToken이 없어요.');
      try { await persistPreviewForJob(jobId, file); } catch {}
      const fileMeta = { name: file.name, size: file.size, type: file.type, uploadId: resolvedUploadId, previewStoreId: jobId };
      setMeta(fileMeta);
      try {
        sessionStorage.setItem(`sse:${jobId}`, sseToken);
        sessionStorage.setItem(`sse:meta:${jobId}`, JSON.stringify(fileMeta));
      } catch {}

      // 3) sse
      setStage('RUNNING');
      const url = `${ANALYZE_ENDPOINTS.SSE(jobId)}?token=${encodeURIComponent(sseToken)}`;
      const es = new EventSource(url);
      esRef.current = es;
      es.addEventListener('progress', (e) => {
        try { const d = JSON.parse(e.data || '{}'); setStage(d.stage || 'RUNNING'); setProgress(d.progress ?? null); } catch {}
      });
      es.addEventListener('result', (e) => {
        try {
          const d = JSON.parse(e.data || '{}');
          const payload = (d.result || d);
          setResult(payload);
          try { sessionStorage.setItem(`sse:report:${jobId}`, JSON.stringify(buildStoredReport(payload, fileMeta))); } catch {}
        } catch {}
        try { es.close(); } catch {}
        setSubmitting(false);
        if (typeof onFinish === 'function') onFinish();
      });
      es.addEventListener('failed', (e) => {
        try {
          const d = JSON.parse(e.data || '{}');
          const reason = (d?.reason || '분석에 실패했어요.');
          setError(reason);
          try { sessionStorage.setItem(`sse:failed:${jobId}`, JSON.stringify(buildStoredFailure(reason, fileMeta))); } catch {}
        } catch { setError('분석에 실패했어요.'); }
        try { es.close(); } catch {}
        setSubmitting(false);
      });
    } catch (err) {
      setError(err?.message || '분석 시작 중 오류가 발생했어요.');
      setSubmitting(false);
    }
  };

  return (
    <div>
      {!result && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input type="file" onChange={(e)=> setFile(e.target.files?.[0] || null)} className="text-xs" />
          <button
            type="button"
            disabled={!file || submitting}
            onClick={onStart}
            className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-semibold text-white ${submitting ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {submitting ? '분석 중…' : '재분석 시작'}
          </button>
          {stage && (
            <span className="text-[11px] text-slate-600 dark:text-slate-400">상태: {stage}{progress!=null ? ` (${Math.round(progress*100)}%)` : ''}</span>
          )}
        </div>
      )}
      {error && (
        <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-950/30 dark:text-rose-200">{error}</div>
      )}
      {result && (
        <div className="mt-3">
          <AnalysisReport data={result} mediaMeta={meta} />
        </div>
      )}
    </div>
  );
}
