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

    const accent = clampedPercent >= 90 ? '#f87171' : clampedPercent >= 70 ? '#fbbf24' : '#34d399';
    const ringStyle = {
        background: `conic-gradient(${accent} ${clampedPercent}%, rgba(148, 163, 184, 0.25) ${clampedPercent}% 100%)`,
    };

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

    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-2.5 py-1 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
            <span className="relative flex h-4 w-4 items-center justify-center" aria-hidden="true">
                <span className="absolute inset-0 rounded-full" style={ringStyle} />
                <span className="absolute inset-[2px] rounded-full bg-white dark:bg-slate-900" />
            </span>
            <span className="relative h-1.5 w-12 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
                <span
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ width: `${clampedPercent}%`, backgroundColor: accent }}
                />
            </span>
            <span className="sr-only">{srLabel}</span>
        </div>
    );
};

export default UsageBadge;
