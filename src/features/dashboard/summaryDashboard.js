import AnalysisHistoryList from "./components/AnalysisHistoryList";
import StatsSummaryBar from "./components/StatsSummaryBar";

const SummaryDashboard = () => {
    return (
        <div className="flex-1 p-4 md:p-6">
            <div className="mx-auto w-full max-w-6xl space-y-6">
                {/* Hero header with soft gradient */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-white to-white" />
                    <div className="relative flex items-center justify-between px-5 py-5 md:px-6 md:py-6">
                        <h1 className="text-lg md:text-xl font-bold text-slate-800">Dashboard</h1>
                        <div className="flex items-center gap-2">
                            <a
                                href="/analyze"
                                className="inline-flex items-center rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                                + New Analysis
                            </a>
                        </div>
                    </div>
                    <div className="relative px-5 pb-5 md:px-6">
                        <StatsSummaryBar />
                    </div>
                </div>

                {/* Body */}
                <AnalysisHistoryList />
            </div>
        </div>
    );
};
export default SummaryDashboard;
