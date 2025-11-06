import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { UploadCloud, ShieldCheck, Clapperboard, LifeBuoy } from 'lucide-react';
import Header from '../app/layout/Header';
import Footer from '../app/layout/Footer/Footer';
import { useAuth } from 'providers/authProvider';
import {
  rememberReturnCheckpoint,
  getReturnCheckpoint,
  clearReturnCheckpoint,
} from '../lib/returnCheckpoint/index.js';
import { CHECKPOINT_TYPES } from '../lib/returnCheckpoint/constants.js';
import { MAX_IMAGE_FILES } from '../features/analyze/constants';
import { fetchQuotaSummary } from '../features/analyze/api/quotaSummary';
import LoginRequiredModal from '../features/analyze/components/LoginRequiredModal';
import ErrorModal from '../features/analyze/components/ErrorModal';

const THEME_STORAGE_KEY = 'preferred-theme';
const resolveInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored =
      window.sessionStorage?.getItem(THEME_STORAGE_KEY) ||
      window.localStorage?.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    return 'dark';
  } catch {
    return 'dark';
  }
};

export default function MobileAnalyzeStart() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { lng } = useParams();
  const { userInfo, accessToken } = useAuth();
  const [theme, setTheme] = useState(resolveInitialTheme);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsgs, setErrorMsgs] = useState([]);
  const [awaitingEmailVerification, setAwaitingEmailVerification] = useState(null);
  const [checkingQuota, setCheckingQuota] = useState(false);
  const loginCompletedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
      window.sessionStorage?.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const refreshTheme = () => setTheme(resolveInitialTheme());
    const handleStorage = (event) => {
      if (event.storageArea === window.localStorage && event.key === THEME_STORAGE_KEY) {
        refreshTheme();
      }
    };
    const handleFocus = () => refreshTheme();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('preferred-theme-change', refreshTheme);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('preferred-theme-change', refreshTheme);
    };
  }, []);

  const isDark = theme === 'dark';
  const localizedPath = useCallback((path) => {
    const prefix = lng ? `/${lng}` : '';
    if (path === '/' && prefix) {
      return prefix;
    }
    return `${prefix}${path}`;
  }, [lng]);

  const uploadRoute = useMemo(
    () => (lng ? `/${lng}/analyze/upload` : '/analyze/upload'),
    [lng]
  );
  const supportRoute = useMemo(
    () => (lng ? `/${lng}/support` : '/support'),
    [lng]
  );

  const proceedToAction = useCallback((action) => {
    if (action === 'sample') {
      navigate(uploadRoute, { state: { sample: true } });
    } else {
      navigate(uploadRoute);
    }
  }, [navigate, uploadRoute]);

  const buildReturnPath = useCallback((action) => {
    if (action === 'sample') {
      return `${uploadRoute}?sample=1`;
    }
    return uploadRoute;
  }, [uploadRoute]);

  const startFlow = useCallback(async (action) => {
    const targetPath = buildReturnPath(action);
    rememberReturnCheckpoint(CHECKPOINT_TYPES.AUTH, targetPath);

    setPendingAction(null);
    if (!accessToken) {
      setPendingAction(action);
      setLoginModalOpen(true);
      return;
    }

    setCheckingQuota(true);
    try {
      const summary = await fetchQuotaSummary();

      if (summary?.loginType === 'EMAIL' && !summary?.emailVerified) {
        setAwaitingEmailVerification(userInfo?.userId || '');
        setErrorMsgs([
          t('mobileAnalyze.uploadPage.errors.emailNotVerified', '이메일 인증이 필요해요. 받은 메일함의 인증 링크를 확인해 주세요.'),
        ]);
        setErrorOpen(true);
        return;
      }

      if ((summary?.remaining ?? 0) <= 0) {
        setErrorMsgs([
          t('mobileAnalyze.uploadPage.errors.quotaExhausted', '이번 달 사용할 수 있는 분석 횟수를 모두 사용했어요.'),
        ]);
        setErrorOpen(true);
        return;
      }

      proceedToAction(action);
      clearReturnCheckpoint(CHECKPOINT_TYPES.AUTH);
    } catch (error) {
      if (error?.status === 401) {
        setPendingAction(action);
        setLoginModalOpen(true);
      } else {
        setErrorMsgs([
          error?.message ||
            t('mobileAnalyze.uploadPage.errors.summaryFailed', '사용 가능 횟수를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.'),
        ]);
        setErrorOpen(true);
      }
    } finally {
      setCheckingQuota(false);
    }
  }, [accessToken, buildReturnPath, proceedToAction, t, userInfo]);

  const handleStart = useCallback(() => {
    startFlow('upload');
  }, [startFlow]);

  const handleSampleStart = useCallback(() => {
    startFlow('sample');
  }, [startFlow]);

  const handleSupport = useCallback(() => {
    navigate(supportRoute);
  }, [navigate, supportRoute]);

  const handleNeedEmailVerification = useCallback((email) => {
    setAwaitingEmailVerification(email || '');
    setErrorMsgs([
      t('mobileAnalyze.uploadPage.errors.emailNotVerified', '이메일 인증이 필요해요. 받은 메일함의 인증 링크를 확인해 주세요.'),
    ]);
    setErrorOpen(true);
  }, [t]);

  const handleNavigateSignup = useCallback(() => {
    const target = buildReturnPath(pendingAction || 'upload');
    rememberReturnCheckpoint(CHECKPOINT_TYPES.AUTH, target);
    setLoginModalOpen(false);
    navigate(localizedPath('/agree'));
  }, [buildReturnPath, localizedPath, navigate, pendingAction]);

  const handleNavigateForgot = useCallback(() => {
    rememberReturnCheckpoint(
      CHECKPOINT_TYPES.AUTH,
      buildReturnPath(pendingAction || 'upload')
    );
    setLoginModalOpen(false);
    navigate(supportRoute);
  }, [buildReturnPath, navigate, pendingAction, supportRoute]);

  const handleLoginSuccess = useCallback(() => {
    loginCompletedRef.current = true;
    setLoginModalOpen(false);
    const { path } = getReturnCheckpoint(CHECKPOINT_TYPES.AUTH);
    if (path) {
      clearReturnCheckpoint(CHECKPOINT_TYPES.AUTH);
      const isSample = path.includes('sample=1') || pendingAction === 'sample';
      navigate(path, {
        replace: true,
        state: isSample ? { sample: true } : undefined,
      });
    }
    setPendingAction(null);
  }, [navigate, pendingAction]);

  useEffect(() => {
    if (accessToken && pendingAction && !loginModalOpen) {
      startFlow(pendingAction);
    }
  }, [accessToken, pendingAction, loginModalOpen, startFlow]);

  const guidanceMessages = useMemo(
    () => [
      t(
        'mobileAnalyze.guidance',
        'Stuck between real or AI-made? Drop those tricky files here.'
      ),
      t(
        'mobileAnalyze.guidance2',
        'Stuck between real or AI-made? Drop those tricky files here.'
      ),
    ],
    [t]
  );

  const rootClass = useMemo(
    () =>
      `min-h-screen flex flex-col ${
        isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`,
    [isDark]
  );

  const headerTitleClass = useMemo(
    () =>
      `text-[1.75rem] font-semibold leading-tight ${
        isDark ? 'text-white' : 'text-slate-900'
      }`,
    [isDark]
  );

  const headerSubtitleClass = useMemo(
    () => `mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`,
    [isDark]
  );

  const guidanceClass = useMemo(
    () =>
      `border-l-2 ${
        isDark ? 'border-indigo-500/40 text-slate-400' : 'border-indigo-200 text-slate-600'
      } pl-3 text-xs`,
    [isDark]
  );

  const analysisCardClass = useMemo(
    () =>
      `rounded-3xl border p-5 ${
        isDark
          ? 'border-slate-800/70 bg-slate-900/70 shadow-[0_20px_44px_-26px_rgba(15,23,42,0.9)]'
          : 'border-slate-200 bg-white shadow-[0_16px_32px_-20px_rgba(148,163,184,0.35)]'
      }`,
    [isDark]
  );

  const iconUploadClass = useMemo(
    () =>
      `inline-flex h-11 w-11 items-center justify-center rounded-2xl ${
        isDark ? 'bg-indigo-500/15 text-indigo-300' : 'bg-indigo-100 text-indigo-600'
      }`,
    [isDark]
  );

  const iconShieldClass = useMemo(
    () =>
      `inline-flex h-11 w-11 items-center justify-center rounded-2xl ${
        isDark ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-100 text-emerald-600'
      }`,
    [isDark]
  );

  const infoTitleClass = useMemo(
    () => `text-sm font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`,
    [isDark]
  );

  const infoCaptionClass = useMemo(
    () => `text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`,
    [isDark]
  );

  const highlightCardClass = useMemo(
    () =>
      `flex w-full items-center gap-3 rounded-[26px] border px-4 py-4 ${
        isDark
          ? 'border-indigo-400/35 bg-indigo-500/12 text-slate-100 shadow-[0_20px_40px_-28px_rgba(79,70,229,0.55)]'
          : 'border-indigo-200 bg-indigo-50 text-slate-900 shadow-[0_16px_30px_-22px_rgba(79,70,229,0.35)]'
      }`,
    [isDark]
  );

  const highlightIconClass = useMemo(
    () =>
      `inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
        isDark ? 'bg-indigo-500/25 text-white' : 'bg-indigo-100 text-indigo-600'
      }`,
    [isDark]
  );

  const highlightBodyTitleClass = useMemo(
    () => `text-sm font-semibold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`,
    [isDark]
  );

  const highlightBodyTextClass = useMemo(
    () =>
      `mt-1 text-[12px] leading-relaxed ${
        isDark ? 'text-indigo-100/80' : 'text-indigo-700/80'
      }`,
    [isDark]
  );

  const supportButtonClass = useMemo(
    () =>
      `flex w-full items-center gap-3 rounded-[26px] border px-4 py-4 text-left text-[12px] transition ${
        isDark
          ? 'border-indigo-400/35 bg-indigo-500/12 text-indigo-100 shadow-[0_20px_40px_-28px_rgba(79,70,229,0.55)] hover:border-indigo-300/60 hover:bg-indigo-500/20'
          : 'border-indigo-200 bg-indigo-50 text-indigo-700 shadow-[0_16px_30px_-24px_rgba(79,70,229,0.35)] hover:border-indigo-300 hover:bg-indigo-100'
      }`,
    [isDark]
  );

  const supportIconClass = useMemo(
    () =>
      `inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
        isDark ? 'bg-indigo-500/20 text-indigo-100' : 'bg-indigo-100 text-indigo-600'
      }`,
    [isDark]
  );

  const supportArrowClass = useMemo(
    () =>
      `inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border ${
        isDark
          ? 'border-indigo-300/60 bg-indigo-500/10 text-indigo-100'
          : 'border-indigo-300 bg-indigo-100 text-indigo-600'
      }`,
    [isDark]
  );

  const sampleButtonClass = useMemo(
    () =>
      `flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 transition ${
        isDark
          ? 'border-indigo-400/40 text-indigo-100 bg-indigo-500/15 hover:border-indigo-300 hover:bg-indigo-500/25'
          : 'border-indigo-200 text-indigo-700 bg-indigo-50 hover:border-indigo-300 hover:bg-indigo-100'
      }`,
    [isDark]
  );

  const sampleIconClass = useMemo(
    () =>
      `inline-flex h-10 w-10 items-center justify-center rounded-full ${
        isDark ? 'bg-indigo-500/25 text-white' : 'bg-indigo-100 text-indigo-600'
      }`,
    [isDark]
  );

  const sampleBodyTitleClass = useMemo(
    () =>
      `text-[11px] font-semibold uppercase tracking-[0.12em] ${
        isDark ? 'text-indigo-200' : 'text-indigo-700'
      }`,
    [isDark]
  );

  const sampleBodyTextClass = useMemo(
    () =>
      `mt-1 text-[11px] ${
        isDark ? 'text-indigo-100/80' : 'text-indigo-600/80'
      }`,
    [isDark]
  );

  const sampleArrowClass = useMemo(
    () =>
      `inline-flex h-6 w-6 items-center justify-center rounded-full border ${
        isDark
          ? 'border-indigo-300/50 bg-indigo-500/10 text-indigo-100'
          : 'border-indigo-200 bg-indigo-100 text-indigo-600'
      }`,
    [isDark]
  );

  const primaryButtonClass = useMemo(
    () =>
      `inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-base font-semibold shadow-lg transition-transform duration-200 ${
        isDark
          ? 'text-white shadow-indigo-500/25 bg-gradient-to-r from-indigo-500 to-indigo-400'
          : 'text-white shadow-indigo-400/30 bg-gradient-to-r from-indigo-500 to-indigo-400'
      }`,
    [isDark]
  );

  // const handleHistory = () => {
  //   if (lng) {
  //     navigate(`/${lng}/analyze/result`);
  //   } else {
  //     navigate('/analyze/result');
  //   }
  // };

  return (
    <div className={rootClass}>
      <Header />
      <main className="flex-1 flex justify-center">
        <div className="flex w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl flex-col gap-6 px-5 pb-12 pt-24">
          <header className="space-y-4">
            <div>
              <h1 className={headerTitleClass}>
                {t('mobileAnalyze.heading', 'Start a new authenticity check')}
              </h1>
              <p className={headerSubtitleClass}>
                {t(
                  'mobileAnalyze.subheading',
                  'Upload up to {{count}} images. We detect synthetic traces in seconds.',
                  { count: MAX_IMAGE_FILES }
                )}
              </p>

              {guidanceMessages.map((message, index) => (
                <p
                  key={index}
                  className={`${guidanceClass} ${index === 0 ? 'mt-3' : 'mt-0.5'}`}
                >
                  {message}
                </p>
              ))}
            </div>
          </header>
          <section className="space-y-4">
            <article className={analysisCardClass}>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className={iconUploadClass}>
                    <UploadCloud size={20} />
                  </span>
                  <div className="flex-1">
                    <p className={infoTitleClass}>
                      {t('mobileAnalyze.actions.upload.title', 'Upload from device')}
                    </p>
                    <p className={infoCaptionClass}>
                      {t(
                        'mobileAnalyze.actions.upload.caption',
                        'Supports PNG, JPG, and HEIC up to 25MB each.'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={iconShieldClass}>
                    <ShieldCheck size={20} />
                  </span>
                  <div className="flex-1">
                    <p className={infoTitleClass}>
                      {t('mobileAnalyze.actions.verify.title', 'Trusted verification')}
                    </p>
                    <p className={infoCaptionClass}>
                      {t(
                        'mobileAnalyze.actions.verify.caption',
                        'We cross-check watermark, EXIF, and neural noise patterns.'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <div className={highlightCardClass}>
              <span className={highlightIconClass}>
                <Clapperboard size={20} />
              </span>
              <div className="flex-1 min-w-0">
                <p className={highlightBodyTitleClass}>
                  {t('mobileAnalyze.videoNoticeTitle', 'Video analysis coming soon')}
                </p>
                <p className={highlightBodyTextClass}>
                  {t('mobileAnalyze.videoNotice', "Video analysis is being prepared. We'll notify you as soon as it's ready.")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSupport}
              className={supportButtonClass}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className={supportIconClass}>
                  <LifeBuoy className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.12em] ${
                      isDark ? 'text-indigo-200' : 'text-indigo-700'
                    } leading-tight`}
                  >
                    {t('mobileAnalyze.supportNotice.title', 'Need assistance?')}
                  </p>
                  <p
                    className={`mt-1 leading-relaxed text-[12px] ${
                      isDark ? 'text-indigo-50/85' : 'text-indigo-700/80'
                    }`}
                  >
                    {t('mobileAnalyze.supportNotice.body', 'If something feels off during the process, reach out and we’ll help you right away.')}
                  </p>
                </div>
              </div>
              <span className={supportArrowClass}>
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </section>
          <button
              type="button"
              onClick={handleSampleStart}
              disabled={checkingQuota}
              className={`${sampleButtonClass} ${
                checkingQuota ? 'cursor-not-allowed opacity-60' : 'hover:shadow-sm'
              }`}
          >
              <span className={sampleIconClass}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16l4-4m0 0l-4-4m4 4H4" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 20h1.25A2.75 2.75 0 0 0 20 17.25v-10.5A2.75 2.75 0 0 0 17.25 4H16" />
                </svg>
              </span>
            <div className="flex-1 text-left">
              <p className={sampleBodyTitleClass}>
                {t('mobileAnalyze.sampleTitle', 'Sample run available')}
              </p>
              <p className={sampleBodyTextClass}>
                {t('mobileAnalyze.sampleNotice', 'Try our sample file first—this one-time test does not count against your daily quota.')}
              </p>
            </div>
            <span className={sampleArrowClass}>
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
          </button>
          <div className="mt-auto space-y-3">
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleStart}
                disabled={checkingQuota}
                className={`${primaryButtonClass} ${
                  checkingQuota ? 'cursor-not-allowed opacity-60' : 'active:scale-[0.99]'
                }`}
              >
                {checkingQuota
                  ? t('mobileAnalyze.uploadPage.ctaLoading', '분석을 준비하고 있어요…')
                  : t('mobileAnalyze.primary', 'Upload images')}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <ErrorModal
        open={errorOpen}
        messages={errorMsgs}
        onClose={() => {
          setErrorOpen(false);
          setErrorMsgs([]);
        }}
        title={t('mobileAnalyze.uploadPage.errors.title', '업로드 오류')}
        theme={isDark ? 'dark' : 'light'}
      />
      <LoginRequiredModal
        open={loginModalOpen}
        onClose={() => {
          setLoginModalOpen(false);
          if (!loginCompletedRef.current) {
            setPendingAction(null);
          }
          loginCompletedRef.current = false;
        }}
        onSuccess={handleLoginSuccess}
        onNeedEmailVerification={handleNeedEmailVerification}
        defaultEmail={awaitingEmailVerification || ''}
        returnPath={buildReturnPath(pendingAction || 'upload')}
        onNavigateSignup={handleNavigateSignup}
        onNavigateForgot={handleNavigateForgot}
      />
    </div>
  );
}
