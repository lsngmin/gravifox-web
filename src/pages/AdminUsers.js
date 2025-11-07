import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import clsx from "clsx";
import { fetchAdminUsers, resetAdminUserQuota } from "../api/admin";
import AdminPageTopBar from "../components/admin/AdminPageTopBar";

const PAGE_SIZE = 20;

const formatDateTime = (value) => {
  if (!value) return "—";
  const parsed = dayjs(value);
  if (!parsed.isValid()) return "—";
  return parsed.format("YYYY-MM-DD HH:mm");
};

const AdminUsers = () => {
  const { lng = "ko" } = useParams();
  const [items, setItems] = useState([]);
  const [pageMeta, setPageMeta] = useState({ page: -1, totalPages: 0, totalElements: 0, size: PAGE_SIZE });
  const [isLoading, setIsLoading] = useState(false);
  const [isAppending, setIsAppending] = useState(false);
  const [error, setError] = useState(null);
  const [resetting, setResetting] = useState(() => new Set());

  const loadPage = useCallback(async (page = 0) => {
    const append = page > 0;
    append ? setIsAppending(true) : setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUsers({ page, size: PAGE_SIZE, sort: "userNo,DESC" });
      const list = data?.items ?? [];
      setItems((prev) => {
        if (!append) return list;
        const seen = new Set(prev.map((x) => x.userNo));
        const merged = [...prev];
        list.forEach((x) => { if (!seen.has(x.userNo)) { merged.push(x); seen.add(x.userNo); } });
        return merged;
      });
      setPageMeta({
        page: data?.page ?? page,
        totalPages: data?.totalPages ?? 0,
        totalElements: data?.totalElements ?? list.length,
        size: data?.size ?? PAGE_SIZE,
      });
    } catch (e) {
      setError(e);
    } finally {
      append ? setIsAppending(false) : setIsLoading(false);
    }
  }, []);

  const handleReset = async (userNo) => {
    setResetting((prev) => new Set(prev).add(userNo));
    try {
      await resetAdminUserQuota(userNo);
      setItems((prev) => prev.map((it) => it.userNo === userNo ? { ...it, monthlyQuotaUsed: 0, monthlyQuotaLimit: it.monthlyQuotaLimit ?? 0 } : it));
    } catch (e) {
      console.error("reset quota failed", e);
    } finally {
      setResetting((prev) => { const next = new Set(prev); next.delete(userNo); return next; });
    }
  };

  useEffect(() => { loadPage(0); }, [loadPage]);

  const canLoadMore = useMemo(() => {
    const { page, totalPages } = pageMeta;
    if (page == null || totalPages == null) return false;
    return page + 1 < totalPages;
  }, [pageMeta]);

  // Styles
  const pageClass = "min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100";
  const containerClass = "mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:px-10 md:py-16";
  const headerTextClass = "max-w-3xl text-sm text-slate-600 md:text-base dark:text-slate-400";
  const tableHeaderCellClass = "px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300";
  const tableBodyCellClass = "px-6 py-4 text-sm text-slate-600 dark:text-slate-300";
  const badgeClass = "rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200";
  const errorBannerClass = "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200";

  return (
    <main className={pageClass}>
      <div className={containerClass}>
        <header className="flex flex-col gap-4">
          <AdminPageTopBar lng={lng} currentLabel="사용자 목록" />
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold md:text-3xl">사용자 목록</h1>
            <p className={headerTextClass}>가입자, 플랜, 월별 사용량을 확인하고 필요 시 할당량을 초기화할 수 있습니다.</p>
          </div>
        </header>

        {error ? (
          <div className={errorBannerClass}>
            데이터를 불러오는 중 오류가 발생했습니다. {error?.message || error?.response?.data?.message || "잠시 후 다시 시도해 주세요."}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="max-h-[70vh] overflow-y-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
              <thead className="bg-slate-100/80 backdrop-blur dark:bg-slate-900/70">
                <tr>
                  <th className={tableHeaderCellClass}>이메일</th>
                  <th className={tableHeaderCellClass}>플랜</th>
                  <th className={tableHeaderCellClass}>이번 달 사용량</th>
                  <th className={tableHeaderCellClass}>가입일</th>
                  <th className={tableHeaderCellClass}>조치</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {isLoading && items.length === 0 ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={`skel-${i}`}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className="px-6 py-4"><div className="h-4 rounded bg-slate-200 dark:bg-slate-800" /></td>
                      ))}
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-sm text-slate-500 dark:text-slate-400">표시할 사용자가 없습니다.</td>
                  </tr>
                ) : (
                  items.map((user) => {
                    const email = user.email || user.userId || "이메일 미상";
                    const quota = user.monthlyQuotaLimit ?? 0;
                    const used = user.monthlyQuotaUsed ?? 0;
                    const ratio = quota > 0 ? Math.min((used / quota) * 100, 100) : 0;
                    const joinedAt = user.createdAt || user.created_at || user.joinedAt || user.createdDate || user.created_date;
                    return (
                      <tr key={user.userNo}>
                        <td className={tableBodyCellClass}>
                          <div className="font-medium text-slate-900 dark:text-slate-100">{email}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">#{user.userNo}</div>
                        </td>
                        <td className={tableBodyCellClass}><span className={badgeClass}>{user.subscriptionPlan ?? "Free"}</span></td>
                        <td className={tableBodyCellClass}>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400"><span>{used}/{quota || "∞"}</span><span>{ratio.toFixed(0)}%</span></div>
                            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                              <div className="h-2 rounded-full bg-sky-400 transition-all dark:bg-sky-500" style={{ width: `${ratio}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className={tableBodyCellClass}>{formatDateTime(joinedAt)}</td>
                        <td className={tableBodyCellClass}>
                          <button
                            onClick={() => handleReset(user.userNo)}
                            disabled={resetting.has(user.userNo)}
                            className={clsx(
                              "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition",
                              resetting.has(user.userNo)
                                ? "cursor-wait border-slate-300 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-500"
                                : "border-sky-500 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-500/50 dark:bg-sky-500/10 dark:text-sky-100"
                            )}
                          >
                            {resetting.has(user.userNo) ? "초기화 중…" : "할당량 초기화"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
                {isAppending ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500 dark:text-slate-400">불러오는 중…</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex items-center justify-center">
          <button
            onClick={() => loadPage((pageMeta?.page ?? 0) + 1)}
            disabled={!canLoadMore || isAppending}
            className={clsx(
              "rounded-full border px-5 py-2 text-sm font-medium transition",
              !canLoadMore || isAppending
                ? "cursor-not-allowed border-slate-300 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-500"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-slate-500"
            )}
          >
            {isAppending ? "불러오는 중…" : canLoadMore ? "더 보기" : "모두 불러왔습니다"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default AdminUsers;

