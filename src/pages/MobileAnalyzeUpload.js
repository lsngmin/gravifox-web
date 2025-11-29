import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { UploadCloud, Check } from 'lucide-react';
import Header from '../app/layout/Header';
import Footer from '../app/layout/Footer/Footer';
import ErrorModal from '../features/analyze/components/ErrorModal';
import ConfirmModelModal from '../features/analyze/components/ConfirmModelModal';
import LoginRequiredModal from '../features/analyze/components/LoginRequiredModal';
import { useAuth } from 'providers/authProvider';
import { useAnalyzeFlow } from '../features/analyze/contexts/AnalyzeFlowContext';
import { persistPreviewForJob } from '../utils/previewStore';
import { useThemeMode } from '../app/hooks/useThemeMode';
import {
  rememberReturnCheckpoint,
  clearReturnCheckpoint,
} from '../lib/returnCheckpoint/index.js';
import { CHECKPOINT_TYPES } from '../lib/returnCheckpoint/constants.js';
import {
  MAX_IMAGE_FILES,
  MAX_IMAGE_SIZE_BYTES,
  SUPPORTED_IMAGE_EXTENSIONS,
  SUPPORTED_IMAGE_EXTENSIONS_LABEL,
  SUPPORTED_IMAGE_MIME_TYPES,
} from '../features/analyze/constants';

const MAX_IMAGE_SIZE_MB = Math.floor(MAX_IMAGE_SIZE_BYTES / (1024 * 1024));

const IMAGE_MIMES = new Set(SUPPORTED_IMAGE_MIME_TYPES);
const IMAGE_EXTS = new Set(SUPPORTED_IMAGE_EXTENSIONS);

const getExt = (file) => {
  const name = (file?.name || '').toLowerCase();
  const idx = name.lastIndexOf('.');
  return idx !== -1 ? name.slice(idx + 1) : '';
};

const isImage = (file) => {
  const type = (file?.type || '').toLowerCase();
  if (IMAGE_MIMES.has(type)) return true;
  return IMAGE_EXTS.has(getExt(file));
};

const isAllowedFile = (file) => isImage(file);

function FileMetaCard({ file, onRemove, labels }) {
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return (
    <div className="overflow-hidden rounded-[28px] border shadow-sm border-slate-200 bg-white dark:border-slate-800/70 dark:bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.18),rgba(15,23,42,0.9))] dark:shadow-[0_34px_68px_-36px_rgba(15,23,42,0.85)]">
      <div className="relative">
        <img src={previewUrl} alt={file?.name || labels.untitled} className="h-48 w-full object-cover" loading="lazy" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 via-black/0" aria-hidden="true" />
        <button
          type="button"
          onClick={onRemove}
          aria-label={labels.remove}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white/85 backdrop-blur-sm transition hover:border-white/50 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <div className="px-5 py-3">
        <p className="truncate text-sm font-semibold text-slate-800 dark:text-white/90">{file?.name || labels.untitled}</p>
      </div>
    </div>
  );
}

export default function MobileAnalyzeUpload() {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const { lng } = useParams();
  const location = useLocation();
  const { accessToken, userInfo } = useAuth();
  const { fetchQuotaSummary: resolveQuotaSummary, fetchModels, submitAnalyzeFiles: runSubmitAnalyze } = useAnalyzeFlow();
  const { themeMode } = useThemeMode();
  const isDarkMode = themeMode === 'dark';

  const [files, setFiles] = useState([]);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsgs, setErrorMsgs] = useState([]);
  const [models, setModels] = useState([]);
  const [modelKey, setModelKey] = useState(null);
  const [defaultModelKey, setDefaultModelKey] = useState(null);
  const [modelError, setModelError] = useState(null);
  const [loadingModels, setLoadingModels] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingResultPath, setPendingResultPath] = useState(null);
  const [quotaSummary, setQuotaSummary] = useState(null);
  const [loadingQuota, setLoadingQuota] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [awaitingEmailVerification, setAwaitingEmailVerification] = useState(null);

  const albumInputRef = useRef(null);
  const sampleAutoFillRef = useRef(false);

  const processingRoute = lng ? `/${lng}/analyze/result` : '/analyze/result';

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const localizedPath = useCallback((path) => {
    const prefix = lng ? `/${lng}` : '';
    if (path === '/' && prefix) {
      return prefix;
    }
    return `${prefix}${path}`;
  }, [lng]);

  const sampleRequested = useMemo(() => {
    if (location.state && location.state.sample) {
      return true;
    }
    return queryParams.get('sample') === '1';
  }, [location.state, queryParams]);

  const quotaNumberFormatter = useMemo(
    () => new Intl.NumberFormat(i18n?.language || undefined),
    [i18n?.language]
  );

  const quotaPeriodLabel = useMemo(() => {
    if (!quotaSummary?.periodStart || !quotaSummary?.periodEnd) return '';
    try {
      const start = new Date(quotaSummary.periodStart);
      const endExclusive = new Date(quotaSummary.periodEnd);
      if (!Number.isNaN(endExclusive.getTime())) {
        endExclusive.setDate(endExclusive.getDate() - 1);
      }
      const formatter = new Intl.DateTimeFormat(i18n?.language || undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return `${formatter.format(start)} ~ ${formatter.format(endExclusive)}`;
    } catch (error) {
      return '';
    }
  }, [quotaSummary, i18n?.language]);

  const loadQuotaSummary = useCallback(async () => {
    if (!accessToken) {
      setQuotaSummary(null);
      return;
    }
    setLoadingQuota(true);
    try {
      const summary = await resolveQuotaSummary();
      setQuotaSummary(summary);
    } catch (error) {
      if (error?.status === 401) {
        setQuotaSummary(null);
      }
    } finally {
      setLoadingQuota(false);
    }
  }, [accessToken, resolveQuotaSummary]);

  useEffect(() => {
    if (accessToken) {
      loadQuotaSummary();
    } else {
      setQuotaSummary(null);
    }
  }, [accessToken, loadQuotaSummary]);

  const ensureQuotaBeforeSubmit = useCallback(async () => {
    if (!accessToken) {
      rememberReturnCheckpoint(
        CHECKPOINT_TYPES.AUTH,
        `${location.pathname}${location.search}`
      );
      setLoginModalOpen(true);
      setLoadingQuota(false);
      return false;
    }
    setLoadingQuota(true);
    try {
      const summary = await resolveQuotaSummary();
      setQuotaSummary(summary);

      if (summary?.loginType === 'EMAIL' && !summary?.emailVerified) {
        setAwaitingEmailVerification(userInfo?.userId || '');
        setErrorMsgs([
          t('mobileAnalyze.uploadPage.errors.emailNotVerified', '이메일 인증이 필요해요. 받은 메일함의 인증 링크를 확인해 주세요.'),
        ]);
        setErrorOpen(true);
        return false;
      }

      if ((summary?.remaining ?? 0) <= 0) {
        setErrorMsgs([
          t('mobileAnalyze.uploadPage.errors.quotaExhausted', '이번 달 사용할 수 있는 분석 횟수를 모두 사용했어요.'),
        ]);
        setErrorOpen(true);
        return false;
      }
      return true;
    } catch (error) {
      if (error?.status === 401) {
        setLoginModalOpen(true);
        return false;
      }
      setErrorMsgs([
        error?.message ||
          t('mobileAnalyze.uploadPage.errors.summaryFailed', '사용 가능 횟수를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.'),
      ]);
      setErrorOpen(true);
      return false;
    } finally {
      setLoadingQuota(false);
    }
  }, [accessToken, location.pathname, location.search, resolveQuotaSummary, t, userInfo]);
  useEffect(() => {
    let aborted = false;
    const loadModels = async () => {
      setLoadingModels(true);
      try {
        const data = await fetchModels();
        if (aborted) return;
        const items = Array.isArray(data?.items) ? data.items : [];
        setModels(items);
        const defaultKey =
          typeof data?.defaultKey === 'string' && data.defaultKey.trim().length > 0
            ? data.defaultKey.trim()
            : null;
        setDefaultModelKey(defaultKey);
        setModelKey((prev) => {
          if (prev && items.some((m) => m.key === prev)) {
            return prev;
          }
          if (defaultKey && items.some((m) => m.key === defaultKey)) {
            return defaultKey;
          }
          return items.length > 0 ? items[0].key : null;
        });
        setModelError(null);
      } catch (err) {
        if (!aborted) {
          setModelError(err?.message || t('mobileAnalyze.uploadPage.modelFetchError', '모델 목록을 불러오지 못했어요.'));
        }
      } finally {
        if (!aborted) {
          setLoadingModels(false);
        }
      }
    };
    loadModels();
    return () => {
      aborted = true;
    };
  }, [fetchModels, t]);

  useEffect(() => {
    if (!sampleRequested || sampleAutoFillRef.current || files.length > 0) {
      return;
    }

    let cancelled = false;
    sampleAutoFillRef.current = true;

    const injectSamples = async () => {
      const base = process.env.PUBLIC_URL || '';
      const sampleNames = ['sample-image-01.png', 'sample-image-02.JPEG'];
      const urls = sampleNames.map((name) => `${base}/samples/${name}`);

      try {
        const responses = await Promise.all(urls.map((url) => fetch(url)));
        if (responses.some((res) => !res.ok)) {
          throw new Error('sample_fetch_failed');
        }

        const blobs = await Promise.all(responses.map((res) => res.blob()));
        if (cancelled) return;

        const now = Date.now();
        const sampleFiles = blobs.map(
          (blob, idx) =>
            new File([blob], sampleNames[idx], {
              type: blob.type || 'image/png',
              lastModified: now + idx,
            })
        );

        setFiles((prev) => (prev.length > 0 ? prev : sampleFiles));
      } catch (err) {
        if (cancelled) return;
        setErrorMsgs([
          t(
            'mobileAnalyze.uploadPage.sampleAutoFillError',
            '샘플 파일을 자동으로 불러오지 못했어요. 다시 시도하거나 직접 업로드해 주세요.'
          ),
        ]);
        setErrorOpen(true);
      }
    };

    injectSamples();

    return () => {
      cancelled = true;
    };
  }, [files.length, sampleRequested, t]);

  const addFiles = (incoming) => {
    const list = Array.from(incoming || []);
    if (!list.length) return;

    const existKey = new Set(files.map((f) => `${f.name}_${f.size}_${f.lastModified}`));
    const next = [...files];
    const dupMsgs = [];
    let invalidTypeFound = false;
    let oversizeFound = false;
    let imageLimitHit = false;

    let currentImageCount = files.length;

    for (const file of list) {
      const okType = isAllowedFile(file);
      if (!okType) {
        invalidTypeFound = true;
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        oversizeFound = true;
        continue;
      }

      const key = `${file.name}_${file.size}_${file.lastModified}`;
      if (files.length > 0 && existKey.has(key)) {
        dupMsgs.push(t('mobileAnalyze.uploadPage.errors.duplicate', '이미 추가한 파일이에요.'));
        continue;
      }

      if (currentImageCount >= MAX_IMAGE_FILES) {
        imageLimitHit = true;
        continue;
      }
      currentImageCount += 1;

      next.push(file);
      existKey.add(key);
    }

    if (next.length !== files.length) {
      setFiles(next);
    }

    const msgs = [];
    if (invalidTypeFound) {
      msgs.push(t('mobileAnalyze.uploadPage.errors.type', '지원하지 않는 파일 형식이에요.'));
      msgs.push(SUPPORTED_IMAGE_EXTENSIONS_LABEL);
    }
    if (oversizeFound) {
      msgs.push(t('mobileAnalyze.uploadPage.errors.size', '파일 용량 제한을 초과했어요.'));
      msgs.push(
        t(
          'mobileAnalyze.uploadPage.errors.sizeHint',
          '이미지는 최대 {{max}}MB까지만 업로드할 수 있어요.',
          { max: MAX_IMAGE_SIZE_MB }
        )
      );
    }
    if (dupMsgs.length > 0) {
      msgs.push(...dupMsgs);
    }
    if (imageLimitHit) {
      msgs.push(t('mobileAnalyze.uploadPage.errors.imageLimit', { max: MAX_IMAGE_FILES }));
    }

    if (msgs.length > 0) {
      setErrorMsgs(msgs);
      setErrorOpen(true);
    }
  };

  const triggerAlbum = () => {
    albumInputRef.current?.click();
  };

  const handleInputChange = (event) => {
    addFiles(event.target.files);
    event.target.value = '';
  };

  const runAnalysis = async () => {
    setSubmitting(true);
    setErrorMsgs([]);
    setErrorOpen(false);
    setPendingResultPath(null);
    let stayOnPage = false;
    try {
      const { jobIds, errors, remainingQuota } = await runSubmitAnalyze(files, {
        modelKey,
        buildMeta: async (file) => ({
          name: file?.name,
          size: file?.size,
          type: file?.type,
          modelKey,
          modelName: selectedModel?.name,
          modelVersion: selectedModel?.version,
          modelDescription: (() => {
            const lang = i18n?.resolvedLanguage || i18n?.language;
            const base = typeof lang === 'string' ? lang.split('-')[0] : undefined;
            const map = selectedModel?.descriptions || {};
            return (lang && map[lang]) || (base && map[base]) || selectedModel?.description;
          })(),
        }),
        afterAnalyze: async (file, analyzeJson) => {
          if (!file || !analyzeJson?.jobId) return;
          await persistPreviewForJob(analyzeJson.jobId, file, analyzeJson.uploadId);
        },
      });

      if (typeof remainingQuota === 'number') {
        setQuotaSummary((prev) =>
          prev
            ? {
                ...prev,
                remaining: remainingQuota,
                used: Math.min(prev.limit - remainingQuota, prev.limit),
              }
            : prev
        );
      }

      if (!jobIds.length) {
        const fallback =
          errors.length > 0
            ? errors
            : [t('mobileAnalyze.uploadPage.errors.submit', '분석을 시작할 수 없어요. 다시 시도해 주세요.')];
        setErrorMsgs(fallback);
        setErrorOpen(true);
        stayOnPage = true;
        return;
      }

      const resultUrl = `${processingRoute}?jobIds=${encodeURIComponent(jobIds.join(","))}`;
      if (errors.length > 0) {
        setErrorMsgs(errors);
        setErrorOpen(true);
        setPendingResultPath(resultUrl);
        stayOnPage = true;
        return;
      }

      navigate(resultUrl, { replace: true });
    } catch (err) {
      stayOnPage = true;
      if (err?.status === 401) {
        setLoginModalOpen(true);
      } else if (err?.status === 403 && err?.code === 'email_not_verified') {
        setAwaitingEmailVerification(userInfo?.userId || '');
        setErrorMsgs([
          t('mobileAnalyze.uploadPage.errors.emailNotVerified', '이메일 인증이 필요해요. 받은 메일함의 인증 링크를 확인해 주세요.'),
        ]);
        setErrorOpen(true);
      } else if (err?.status === 429 || err?.code === 'quota_exhausted') {
        setErrorMsgs([
          t('mobileAnalyze.uploadPage.errors.quotaExhausted', '이번 달 사용할 수 있는 분석 횟수를 모두 사용했어요.'),
        ]);
        setErrorOpen(true);
      } else {
        const message = err?.message || t('mobileAnalyze.uploadPage.errors.submit', '분석 시작 중 오류가 발생했어요.');
        setErrorMsgs([message]);
        setErrorOpen(true);
      }
      setPendingResultPath(null);
    } finally {
      if (stayOnPage) {
        setSubmitting(false);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!files.length || submitting) return;
    const allowed = await ensureQuotaBeforeSubmit();
    if (!allowed) return;
    setConfirmOpen(true);
  };

  const handleReset = () => setFiles([]);

  const imageCount = useMemo(() => files.length, [files]);
  const imageCountLabel = t('mobileAnalyze.uploadPage.counter.images', { count: imageCount, max: MAX_IMAGE_FILES });
  const gradientIntensity = Math.min(imageCount / MAX_IMAGE_FILES, 1);
  const countCardStyle = useMemo(() => {
    const glow = (0.2 + gradientIntensity * 0.35).toFixed(3);
    const border = (0.35 + gradientIntensity * 0.45).toFixed(3);
    const shadow = (0.35 + gradientIntensity * 0.3).toFixed(3);
    const darkBackground = `linear-gradient(135deg, rgba(99,102,241,${glow}), rgba(15,23,42,0.9))`;
    const lightBackground = `linear-gradient(135deg, rgba(79,70,229,${glow}), rgba(248,250,255,0.9))`;
    const darkBorder = `rgba(99,102,241,${border})`;
    const lightBorder = `rgba(148,163,184,${border})`;
    const darkShadow = `0 24px 50px -30px rgba(99,102,241,${shadow})`;
    const lightShadow = `0 24px 50px -34px rgba(148,163,184,${shadow})`;
    return {
      background: isDarkMode ? darkBackground : lightBackground,
      borderColor: isDarkMode ? darkBorder : lightBorder,
      boxShadow: isDarkMode ? darkShadow : lightShadow,
    };
  }, [gradientIntensity, isDarkMode]);

  const selectedModel = useMemo(() => models.find((item) => item.key === modelKey), [models, modelKey]);
  const hasFiles = files.length > 0;
  const canAddMoreImages = files.length < MAX_IMAGE_FILES;
  const analyzeDisabled = !files.length || submitting || !modelKey;
  const uploadDisabled = files.length >= MAX_IMAGE_FILES || submitting;

  const metaLabels = {
    remove: t('mobileAnalyze.uploadPage.meta.remove', '선택한 파일 제거'),
    untitled: t('mobileAnalyze.uploadPage.meta.untitled', '이름 없음'),
  };

  const handleLoginSuccess = useCallback(async () => {
    clearReturnCheckpoint(CHECKPOINT_TYPES.AUTH);
    await loadQuotaSummary();
  }, [loadQuotaSummary]);

  const handleEmailVerificationNeeded = useCallback(
    (email) => {
      const nextEmail = email || '';
      setAwaitingEmailVerification(nextEmail);
      setLoginModalOpen(false);
      navigate(localizedPath('/verify'), { state: { email: nextEmail } });
    },
    [localizedPath, navigate]
  );

  const handleNavigateSignup = useCallback(() => {
    rememberReturnCheckpoint(
      CHECKPOINT_TYPES.AUTH,
      `${location.pathname}${location.search}`
    );
    setLoginModalOpen(false);
    navigate(localizedPath('/agree'));
  }, [localizedPath, location.pathname, location.search, navigate]);

  const handleNavigateForgot = useCallback(() => {
    rememberReturnCheckpoint(
      CHECKPOINT_TYPES.AUTH,
      `${location.pathname}${location.search}`
    );
    setLoginModalOpen(false);
    navigate(localizedPath('/support'));
  }, [localizedPath, location.pathname, location.search, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header />
      <main className="flex-1 flex justify-center">
        <div className="flex w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl flex-col gap-6 px-5 pb-14 pt-24">
              <button
                type="button"
                onClick={() => navigate(lng ? `/${lng}/analyze` : '/analyze')}
                className="inline-flex w-fit items-center gap-1 self-start text-xs font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200"
              >
                <span aria-hidden="true">←</span>
                {t('mobileAnalyze.uploadPage.back', '모바일 분석 홈')}
              </button>
              <header className="space-y-3">
                <div>
                  <h1 className="text-[1.75rem] font-semibold leading-tight">
                    {t('mobileAnalyze.uploadPage.heading', '모바일에서 바로 업로드')}
                  </h1>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {t('mobileAnalyze.uploadPage.subheading', '촬영하거나 앨범에서 선택해 AI 흔적을 확인해 보세요.')}
                  </p>
                  <p className="mt-3 border-l-2 border-indigo-300 pl-3 text-xs text-slate-600 dark:border-indigo-500/40 dark:text-slate-400">
                    {t('mobileAnalyze.uploadPage.hint', '이미지 3장까지 한 번에 업로드할 수 있어요.')}
                  </p>
                </div>
              </header>

              {loadingQuota && !quotaSummary && (
                <div className="rounded-3xl border px-4 py-4 text-[12px] shadow-[0_20px_40px_-28px_rgba(79,70,229,0.25)] border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-slate-800/60 dark:bg-slate-900/70 dark:text-slate-200 dark:shadow-[0_20px_40px_-28px_rgba(15,23,42,0.7)]">
                  {t('mobileAnalyze.uploadPage.quota.loading', '사용 가능 횟수를 불러오는 중이에요…')}
                </div>
              )}

              {quotaSummary && (
                <div className="rounded-3xl border px-4 py-4 shadow-[0_20px_40px_-28px_rgba(79,70,229,0.35)] border-indigo-200 bg-indigo-50 text-slate-900 dark:border-slate-800/60 dark:bg-slate-900/70 dark:text-slate-100 dark:shadow-[0_20px_40px_-28px_rgba(15,23,42,0.8)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-700/80 dark:text-indigo-200">
                    {t('mobileAnalyze.uploadPage.quota.title', '이번 달 남은 분석')}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                    {quotaNumberFormatter.format(quotaSummary.remaining)}
                    <span className="ml-2 text-sm text-indigo-700/80 dark:text-indigo-100/75">
                      / {quotaNumberFormatter.format(quotaSummary.limit)}
                    </span>
                  </p>
                  {quotaPeriodLabel && (
                    <p className="mt-2 text-[11px] text-indigo-700/70 dark:text-indigo-100/70">
                      {t('mobileAnalyze.uploadPage.quota.period', {
                        defaultValue: '집계 기간: {{period}}',
                        period: quotaPeriodLabel,
                      })}
                    </p>
                  )}
                  {quotaSummary.loginType === 'EMAIL' && !quotaSummary.emailVerified && (
                    <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-200/80">
                      {t('mobileAnalyze.uploadPage.quota.emailPending', '이메일 인증이 완료되면 바로 이용할 수 있어요.')}
                    </p>
                  )}
                </div>
              )}

              <section className="space-y-4">
                <div className="px-1 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                        {t('mobileAnalyze.uploadPage.modelSection.title', '분석 모델 선택')}
                      </p>
                      <p className="mt-1 text-[12px] text-slate-600 dark:text-slate-400">
                        {t('mobileAnalyze.uploadPage.modelSection.hint', '사용할 분석 모델을 고르면 결과가 더 정확해져요.')}
                      </p>
                    </div>
                  </div>
                  {loadingModels && (
                    <p className="text-[12px] text-slate-500 dark:text-slate-400">
                      {t('mobileAnalyze.uploadPage.modelSection.loading', '모델 정보를 불러오는 중이에요…')}
                    </p>
                  )}
                  {!loadingModels && modelError && (
                    <p className="text-[12px] text-rose-300">
                      {modelError}
                    </p>
                  )}
                  {!loadingModels && !modelError && models.length === 0 && (
                    <p className="text-[12px] text-slate-500 dark:text-slate-400">
                      {t('mobileAnalyze.uploadPage.modelSection.empty', '사용 가능한 모델이 없어요. 기본 설정으로 진행합니다.')}
                    </p>
                  )}
                  {!loadingModels && !modelError && models.length > 0 && (
                    <div className="space-y-2">
                      {models.map((model) => {
                        const selected = model.key === modelKey;
                        const isDefault = model.key === defaultModelKey;
                        const lang = i18n?.resolvedLanguage || i18n?.language;
                        const base = typeof lang === 'string' ? lang.split('-')[0] : undefined;
                        const localizedDesc = (model?.descriptions && ((lang && model.descriptions[lang]) || (base && model.descriptions[base]))) || model?.description;
                        return (
                          <button
                            key={model.key}
                            type="button"
                            onClick={() => setModelKey(model.key)}
                            aria-pressed={selected}
                            className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                              selected
                                ? 'border-indigo-300 bg-indigo-50 text-slate-900 shadow-[0_18px_36px_-28px_rgba(99,102,241,0.45)] dark:border-indigo-400/70 dark:bg-indigo-500/15 dark:text-indigo-50'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-indigo-400/40 dark:hover:bg-slate-900/60'
                            }`}
                          >
                            <div className="flex flex-1 flex-col justify-center">
                              <p className="flex items-center text-sm font-semibold text-inherit">
                                {model.name}
                                {isDefault && (
                                  <span className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
                                    {t('mobileAnalyze.uploadPage.modelSection.recommended', '기본')}
                                  </span>
                                )}
                              </p>
                              {localizedDesc && (
                                <p className="mt-1 text-[12px] text-slate-600 dark:text-slate-400">
                                  {localizedDesc}
                                </p>
                              )}
                            </div>
                            <span
                              className={`inline-flex h-6 w-6 items-center justify-center self-center rounded-full border ${
                                selected
                                  ? 'border-indigo-300 bg-indigo-500/20 text-indigo-700 dark:bg-indigo-500/30 dark:text-white'
                                  : 'border-slate-300 text-slate-500 dark:border-slate-700'
                              }`}
                              aria-hidden="true"
                            >
                              {selected ? <Check size={14} strokeWidth={2.5} /> : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="px-1">
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5 text-indigo-600/80 dark:text-indigo-200/80">
                      <UploadCloud size={18} />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                        {t('mobileAnalyze.uploadPage.actions.album', '앨범에서 선택')}
                      </p>
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                        {t('mobileAnalyze.uploadPage.steps.selectHint', 'PNG, JPG, WEBP 형식을 지원해요.')}
                      </p>
                    </div>
                  </div>
                </div>

                {files.length === 0 ? (
                  <div className="rounded-[28px] border px-6 py-12 text-center text-sm shadow-sm border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800/70 dark:bg-[linear-gradient(150deg,rgba(15,23,42,0.85),rgba(17,24,39,0.7))] dark:text-slate-300 dark:shadow-[0_24px_54px_-32px_rgba(15,23,42,0.85)]">
                    <p>{t('mobileAnalyze.uploadPage.emptyState', '아직 선택한 파일이 없어요.')}</p>
                    <p className="mt-2 text-[12px] text-slate-500 dark:text-slate-400">
                      {t('mobileAnalyze.uploadPage.emptyHint', '아래 버튼을 눌러 바로 시작해 보세요.')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div
                      className="flex min-h-[52px] items-center justify-between gap-4 rounded-[26px] border px-5 py-3 text-sm font-semibold text-indigo-700 dark:text-indigo-100"
                      style={countCardStyle}
                    >
                      <span className="leading-none tracking-wide">{imageCountLabel}</span>
                      <span className="inline-flex h-2 w-14 items-center rounded-full bg-white/40 dark:bg-indigo-200/30">
                        <span
                          className="h-full rounded-full bg-indigo-600 transition-[width] duration-300 dark:bg-indigo-100"
                          style={{ width: `${Math.min(100, Math.max(12, gradientIntensity * 100))}%` }}
                        />
                      </span>
                    </div>
                    <div className="space-y-4">
                      {files.map((file, index) => (
                        <FileMetaCard
                          key={`${file.name}_${file.size}_${index}`}
                          file={file}
                          onRemove={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                          labels={metaLabels}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {hasFiles && canAddMoreImages && (
                <div className="flex flex-col items-center gap-2 rounded-[26px] border px-4 py-4 text-center text-xs shadow-sm border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-300 dark:shadow-[0_22px_48px_-34px_rgba(15,23,42,0.8)]">
                  <span>{t('mobileAnalyze.uploadPage.moreHint', '추가로 업로드할 이미지가 있으신가요?')}</span>
                  <button
                    type="button"
                    onClick={triggerAlbum}
                    className="inline-flex items-center justify-center rounded-full border px-3 py-1 text-[11px] font-semibold transition border-indigo-300 text-indigo-700 hover:border-indigo-400 hover:text-indigo-800 dark:border-indigo-400/40 dark:text-indigo-200 dark:hover:border-indigo-300 dark:hover:text-white"
                  >
                    {t('mobileAnalyze.uploadPage.moreAction', '이미지 더 올리기')}
                  </button>
                </div>
              )}

              {hasFiles && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-3 w-full text-center text-xs font-semibold text-slate-500 underline-offset-4 transition hover:text-slate-700 hover:underline dark:text-slate-400 dark:hover:text-slate-200"
                >
                  {t('mobileAnalyze.uploadPage.reset', '모든 파일 비우기')}
                </button>
              )}

              <div className="mt-2 space-y-3">
                {!hasFiles && (
                  <button
                    type="button"
                    onClick={triggerAlbum}
                    disabled={uploadDisabled}
                    className={`inline-flex w-full items-center justify-center rounded-[28px] px-4 py-3 text-base font-semibold transition ${
                      uploadDisabled
                        ? 'cursor-not-allowed border border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800/60'
                        : 'border border-indigo-300 bg-indigo-50 text-indigo-700 hover:border-indigo-400 hover:bg-indigo-100 dark:border-indigo-400/40 dark:bg-indigo-500/15 dark:text-indigo-100 dark:hover:border-indigo-300 dark:hover:bg-indigo-500/25'
                    }`}
                  >
                    {t('mobileAnalyze.uploadPage.primaryAction', '이미지 업로드하기')}
                  </button>
                )}
                <button
                  type="button"
                  disabled={analyzeDisabled}
                  onClick={handleAnalyze}
                  className={`inline-flex w-full items-center justify-center rounded-[28px] px-4 py-3 text-base font-semibold shadow-[0_26px_60px_-34px_rgba(99,102,241,0.55)] transition ${
                    !analyzeDisabled
                      ? 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-400 text-white active:scale-[0.99]'
                      : 'cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800/60'
                  }`}
                >
                  {submitting
                    ? t('mobileAnalyze.uploadPage.ctaLoading', '분석을 준비하고 있어요…')
                    : t('mobileAnalyze.uploadPage.cta', '분석 시작하기')}
                </button>
              </div>
        </div>
      </main>
      <Footer />

      <input
        ref={albumInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />

      <ErrorModal
        open={errorOpen}
        messages={errorMsgs}
        onClose={() => {
          setErrorOpen(false);
          setErrorMsgs([]);
          if (pendingResultPath) {
            const next = pendingResultPath;
            setPendingResultPath(null);
            navigate(next, { replace: true });
          }
        }}
        title={t('mobileAnalyze.uploadPage.errors.title', '업로드 오류')}
      />
      <LoginRequiredModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
        onNeedEmailVerification={handleEmailVerificationNeeded}
        defaultEmail={awaitingEmailVerification || ''}
        returnPath={location.pathname + location.search}
        onNavigateSignup={handleNavigateSignup}
        onNavigateForgot={handleNavigateForgot}
      />

      <ConfirmModelModal
        open={confirmOpen}
        model={selectedModel}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          runAnalysis();
        }}
      />
    </div>
  );
}
