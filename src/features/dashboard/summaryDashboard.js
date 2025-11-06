import { useTranslation } from 'react-i18next';
import AnalysisHistoryList from "./components/AnalysisHistoryList";

const SummaryDashboard = () => {
    const { t } = useTranslation('dashboard');

    return (
        <div className="flex-1 bg-gray-50 p-4 text-slate-900 dark:bg-[#13213f] dark:text-slate-100 md:p-6">
            <div className="mx-auto w-full max-w-6xl space-y-6">
                {/* Dashboard hero */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-7 shadow-md md:px-6 md:py-8 dark:border-slate-700/55 dark:bg-slate-700/60 dark:shadow-lg dark:shadow-slate-900/20">
                    <div className="absolute inset-0 hidden bg-gradient-to-br from-indigo-100 via-white to-indigo-50 opacity-70 dark:block dark:from-indigo-700/30 dark:via-slate-900/70 dark:to-indigo-900/50" />
                    <div className="absolute inset-y-0 right-[-10%] hidden w-64 bg-gradient-to-l from-violet-200 via-indigo-100 to-transparent blur-3xl opacity-70 dark:block dark:from-violet-500/35 dark:via-indigo-400/20" aria-hidden="true" />
                    <div className="absolute -top-24 -left-24 hidden h-48 w-48 rounded-full bg-gradient-to-br from-indigo-200 via-violet-100 to-transparent blur-3xl opacity-70 dark:block dark:from-indigo-500/30 dark:via-violet-500/20" aria-hidden="true" />
                    <div className="relative space-y-3">
                        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl dark:text-slate-100">
                            {t('hero.titleMain', { defaultValue: 'Dashboard' })}
                            <span className="ml-2 text-lg font-medium text-indigo-700 md:text-xl dark:text-indigo-200/80">{t('hero.titleSub', { defaultValue: 'Control Center' })}</span>
                        </h1>
                        <p className="max-w-2xl text-sm text-slate-600 sm:text-base dark:text-slate-400">{t('hero.desc', { defaultValue: '최근 분석 결과를 모아놨어요.' })}</p>
                    </div>
                </div>

                {/* Hero header with soft gradient */}
                {/*
                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg shadow-slate-900/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 opacity-95" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_55%)]" />
                    <div className="relative px-5 py-6 md:px-6 md:py-7">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <h1 className="text-lg font-semibold text-slate-100 sm:text-xl md:text-2xl">Dashboard</h1>
                        </div>
                        <div className="mt-6">
                            <StatsSummaryBar />
                        </div>
                    </div>
                </div>
                */}

                {/* Removed new analysis button per request */}

                {/* Body */}
                <AnalysisHistoryList />
            </div>
        </div>
    );
};
export default SummaryDashboard;
