import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { UploadCloud, ShieldCheck, Clapperboard, LifeBuoy } from 'lucide-react';
import Navigation from '../features/navigation/navigation';
import Footer from '../features/footer/footer';
import { useAuth } from 'providers/authProvider';

export default function MobileAnalyzeStart() {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const { lng } = useParams();
  const { userInfo } = useAuth();

  const formatNumber = useMemo(
    () => new Intl.NumberFormat(i18n.language || 'en'),
    [i18n.language]
  );

  const guestDailyQuota = 10;
  const memberDailyQuota = userInfo?.dailyQuota ?? 20;
  const totalQuota = userInfo ? memberDailyQuota : guestDailyQuota;
  const usedToday = userInfo?.todayAnalyzeCount ?? 0;
  const remainingSessions = Math.max(totalQuota - usedToday, 0);
  const formattedRemaining = formatNumber.format(remainingSessions);
  const formattedTotal = formatNumber.format(totalQuota);
  const formattedUpgrade = formatNumber.format(memberDailyQuota);
  const isLoggedIn = Boolean(userInfo);

  const uploadRoute = lng ? `/${lng}/analyze/upload` : '/analyze/upload';
  const supportRoute = lng ? `/${lng}/support` : '/support';

  const handleStart = () => {
    navigate(uploadRoute);
  };

  // const handleHistory = () => {
  //   if (lng) {
  //     navigate(`/${lng}/analyze/result`);
  //   } else {
  //     navigate('/analyze/result');
  //   }
  // };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navigation variant="dark" />
      <main className="flex-1 flex justify-center">
        <div className="flex w-full max-w-sm flex-col gap-6 px-5 pb-12 pt-24">
          <header className="space-y-4">
            <div>
              <h1 className="text-[1.75rem] font-semibold leading-tight">
                {t('mobileAnalyze.heading', 'Start a new authenticity check')}
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                {t(
                  'mobileAnalyze.subheading',
                  'Upload up to 5 images. We detect synthetic traces in seconds.'
                )}
              </p>

              <p className="mt-3 border-l-2 border-indigo-500/40 pl-3 text-xs text-slate-400">
                {t('mobileAnalyze.guidance', 'Stuck between real or AI-made? Drop those tricky files here.')}
              </p>
              <p className="mt-0.5 border-l-2 border-indigo-500/40 pl-3 text-xs text-slate-400">
                {t('mobileAnalyze.guidance2', 'Stuck between real or AI-made? Drop those tricky files here.')}
              </p>
            </div>
          </header>

          <div className="rounded-3xl border border-indigo-500/25 bg-gradient-to-br from-indigo-600/20 via-slate-900/70 to-slate-900/60 p-5 shadow-[0_22px_50px_-30px_rgba(99,102,241,0.6)]">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  {t('mobileAnalyze.sessions.title', 'Sessions left today')}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-200">
                  {isLoggedIn
                    ? t('mobileAnalyze.sessions.memberDescription', {
                        remaining: formattedRemaining,
                        total: formattedTotal,
                      })
                    : t('mobileAnalyze.sessions.guestDescription', {
                        remaining: formattedRemaining,
                        upgrade: formattedUpgrade,
                      })}
                </p>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-slate-500">
              {t('mobileAnalyze.sessions.resetHint', 'Usage resets every midnight.')}
            </p>
          </div>

          <section className="space-y-4">
            <article className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-5 shadow-[0_20px_44px_-26px_rgba(15,23,42,0.9)]">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300">
                    <UploadCloud size={20} />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-100">
                      {t('mobileAnalyze.actions.upload.title', 'Upload from device')}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t(
                        'mobileAnalyze.actions.upload.caption',
                        'Supports PNG, JPG, and HEIC up to 25MB each.'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                    <ShieldCheck size={20} />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-100">
                      {t('mobileAnalyze.actions.verify.title', 'Trusted verification')}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t(
                        'mobileAnalyze.actions.verify.caption',
                        'We cross-check watermark, EXIF, and neural noise patterns.'
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(uploadRoute, { state: { sample: true } })}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-indigo-400/40 bg-indigo-500/15 px-3 py-3 text-indigo-100 transition hover:border-indigo-300 hover:bg-indigo-500/25"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/25 text-white">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16l4-4m0 0l-4-4m4 4H4" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 20h1.25A2.75 2.75 0 0 0 20 17.25v-10.5A2.75 2.75 0 0 0 17.25 4H16" />
                    </svg>
                  </span>
                  <div className="flex-1 text-left">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-200">
                      {t('mobileAnalyze.sampleTitle', 'Sample run available')}
                    </p>
                    <p className="mt-1 text-[11px] text-indigo-100/80">
                      {t('mobileAnalyze.sampleNotice', 'Try our sample file first—this one-time test does not count against your daily quota.')}
                    </p>
                  </div>
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-indigo-300/50 bg-indigo-500/10 text-indigo-100">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </div>
            </article>

            <div className="flex w-full items-center gap-3 rounded-[26px] border border-indigo-400/35 bg-indigo-500/12 px-4 py-4 text-slate-100 shadow-[0_20px_40px_-28px_rgba(79,70,229,0.55)]">
              <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/25 text-white">
                <Clapperboard size={20} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-tight">
                  {t('mobileAnalyze.videoNoticeTitle', 'Video analysis coming soon')}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-indigo-100/80">
                  {t('mobileAnalyze.videoNotice', "Video analysis is being prepared. We'll notify you as soon as it's ready.")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(supportRoute)}
              className="flex w-full items-center gap-3 rounded-[26px] border border-indigo-400/35 bg-indigo-500/12 px-4 py-4 text-left text-[12px] text-slate-100 shadow-[0_20px_40px_-28px_rgba(79,70,229,0.55)] transition hover:border-indigo-300/60 hover:bg-indigo-500/20"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-100">
                  <LifeBuoy className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-200 leading-tight">
                    {t('mobileAnalyze.supportNotice.title', 'Need assistance?')}
                  </p>
                  <p className="mt-1 leading-relaxed text-[12px] text-indigo-50/85">
                    {t('mobileAnalyze.supportNotice.body', 'If something feels off during the process, reach out and we’ll help you right away.')}
                  </p>
                </div>
              </div>
              <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-indigo-300/60 bg-indigo-500/10 text-indigo-100">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </section>

          <div className="mt-auto space-y-3">
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-400 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-transform duration-200 active:scale-[0.99]"
            >
              {t('mobileAnalyze.primary', 'Upload images')}
            </button>
            {/* <button
              type="button"
              onClick={handleHistory}
              className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm font-semibold text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
            >
              {isLoggedIn
                ? t('mobileAnalyze.secondaryAuthed')
                : t('mobileAnalyze.secondary', 'View recent reports')}
            </button> */}
          </div>
        </div>
      </main>
      <Footer transparent inline variant="dark" showLinks={false} />
    </div>
  );
}
