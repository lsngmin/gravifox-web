import React, { useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { fetchQuotaSummary } from 'features/analyze/api/quotaSummary';
import { useAuth } from 'providers/authProvider';

import { useHeaderContext } from '../context';

const UsageSummary = () => {
    const { isMenuOpen } = useHeaderContext();
    const { userInfo } = useAuth();
    const { t, i18n } = useTranslation('common');

    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isMenuOpen) return undefined;
        if (!userInfo) return undefined;
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await fetchQuotaSummary();
                if (!cancelled) {
                    setSummary(result || null);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        t('navigation.usage.errorFallback', '사용량 정보를 불러오는 중 문제가 발생했어요.')
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        if (!summary && !loading) {
            load();
        }

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMenuOpen, userInfo]);

    useEffect(() => {
        if (!userInfo) {
            setSummary(null);
            setLoading(false);
            setError(null);
        }
    }, [userInfo]);

    const numberFormatter = useMemo(
        () => new Intl.NumberFormat(i18n?.language || undefined),
        [i18n?.language]
    );

    const limit = Number.isFinite(summary?.limit) ? Math.max(0, summary.limit) : null;
    const remaining = Number.isFinite(summary?.remaining) ? Math.max(0, summary.remaining) : null;
    const used = limit != null && remaining != null ? Math.max(0, limit - remaining) : null;
    const percent =
        limit != null && limit > 0 && used != null
            ? Math.min(100, Math.max(0, (used / limit) * 100))
            : used != null && limit === 0
            ? 100
            : null;

    if (!userInfo) {
        return null;
    }

    return (
        <section className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                {t('navigation.usage.title', '이번 달 사용량')}
            </h3>
            {loading && (
                <div className="mt-3 space-y-2">
                    <div className="h-2 w-full animate-pulse rounded-full bg-gray-200 dark:bg-slate-800" />
                    <div className="h-2 w-1/2 animate-pulse rounded-full bg-gray-200 dark:bg-slate-800" />
                </div>
            )}
            {!loading && error && (
                <p className="mt-3 text-sm text-rose-500 dark:text-rose-300">{error}</p>
            )}
            {!loading && !error && percent != null && (
                <>
                    <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-slate-800">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                            style={{ width: `${percent.toFixed(0)}%` }}
                        />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
                        <span>
                            {t('navigation.usage.summary', {
                                defaultValue: '총 {{limit}}회 중 {{used}}회 사용',
                                limit: numberFormatter.format(limit ?? 0),
                                used: numberFormatter.format(used ?? 0),
                            })}
                        </span>
                        {remaining != null && (
                            <span>
                                {t('navigation.usage.remainingShort', {
                                    defaultValue: '잔여 {{count}}회',
                                    count: numberFormatter.format(remaining),
                                })}
                            </span>
                        )}
                    </div>
                </>
            )}
            {!loading && !error && percent == null && (
                <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">
                    {t('navigation.usage.empty', '사용량 정보가 아직 준비되지 않았어요.')}
                </p>
            )}
        </section>
    );
};

export default UsageSummary;
