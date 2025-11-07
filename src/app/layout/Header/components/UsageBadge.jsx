import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { fetchQuotaSummary } from 'features/analyze/api/quotaSummary';
import { useAuth } from 'providers/authProvider';

const UsageBadge = () => {
    const { userInfo } = useAuth();
    const { t, i18n } = useTranslation('common');

    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userInfo) {
            setSummary(null);
            setLoading(false);
            setError(null);
            return;
        }

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
                    setError(err);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [userInfo]);

    const numberFormatter = useMemo(
        () => new Intl.NumberFormat(i18n?.language || undefined),
        [i18n?.language]
    );

    const limit = Number.isFinite(summary?.limit) ? Math.max(0, summary.limit) : null;
    const remaining = Number.isFinite(summary?.remaining) ? Math.max(0, summary.remaining) : null;
    const used = limit != null && remaining != null ? Math.max(0, limit - remaining) : null;

    if (!userInfo) {
        return null;
    }

    const clampedPercent = (() => {
        if (limit != null && limit > 0 && used != null) {
            return Math.min(100, Math.max(0, (used / limit) * 100));
        }
        if (limit === 0) {
            return 100;
        }
        if (remaining != null && limit == null) {
            return 0;
        }
        return 0;
    })();

    // Traffic light thresholds based on used percent
    const greenActive = clampedPercent < 70;
    const yellowActive = clampedPercent >= 70 && clampedPercent < 90;
    const redActive = clampedPercent >= 90;

    const activeVariant = greenActive ? 'green' : yellowActive ? 'amber' : 'red';
    const activeTitle = greenActive
        ? t('navigation.usage.green', '충분함')
        : yellowActive
        ? t('navigation.usage.yellow', '주의')
        : t('navigation.usage.red', '한계 임박');
    const activeClassName =
        activeVariant === 'green'
            ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] ring-1 ring-green-300/60'
            : activeVariant === 'amber'
            ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] ring-1 ring-amber-300/60'
            : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] ring-1 ring-red-300/60';

    const srLabel = (() => {
        if (limit != null && used != null) {
            return t('navigation.usage.summary', {
                defaultValue: '{{used}} / {{limit}}회 사용',
                used: numberFormatter.format(used),
                limit: numberFormatter.format(limit),
            });
        }
        if (remaining != null) {
            return t('navigation.usage.remainingOnly', {
                defaultValue: '남은 분석 {{count}}회',
                count: numberFormatter.format(remaining),
            });
        }
        return t('navigation.usage.empty', '사용량 정보 준비 중');
    })();

    if (loading) {
        return (
            <div
                className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/60 px-2.5 py-1 shadow-sm dark:border-indigo-500/40 dark:bg-indigo-500/10"
                aria-live="polite"
            >
                <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500 dark:border-indigo-500/40 dark:border-t-indigo-300" aria-hidden="true" />
                <span className="sr-only">{t('navigation.usage.loading', '사용량 정보를 불러오는 중')}</span>
            </div>
        );
    }

    if (error || (!summary && limit == null && remaining == null)) {
        return (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t('navigation.usage.emptyShort', '사용량 준비 중')}
            </span>
        );
    }

    const labelShort = (() => {
        if (remaining != null) {
            return t('navigation.usage.remainingShort', {
                defaultValue: '잔여 {{count}}회',
                count: numberFormatter.format(remaining),
            });
        }
        if (limit != null && used != null) {
            return t('navigation.usage.compact', {
                defaultValue: '{{used}}/{{limit}}',
                used: numberFormatter.format(used),
                limit: numberFormatter.format(limit),
            });
        }
        return '';
    })();

    return (
        <div
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-2.5 py-1 shadow-sm dark:border-slate-700 dark:bg-slate-800/80"
            role="status"
            aria-live="polite"
        >
            <span className="flex items-center" aria-hidden="true">
                <span
                    className={"h-3 w-3 rounded-full transition-all " + activeClassName}
                    title={activeTitle}
                />
            </span>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{labelShort}</span>
            <span className="sr-only">{srLabel}</span>
        </div>
    );
};

export default UsageBadge;
