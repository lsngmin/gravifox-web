import React from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import AdminThemeToggle from "./AdminThemeToggle";

const AdminPageTopBar = ({ lng = "ko", currentLabel, className }) => {
    const adminHomePath = `/${lng}/admin`;

    return (
        <div className={clsx("flex w-full flex-wrap items-center justify-between gap-3", className)}>
            <div className="flex flex-wrap items-center gap-2">
                <Link
                    to={adminHomePath}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white dark:focus-visible:ring-slate-400 dark:focus-visible:ring-offset-slate-950"
                >
                    <ArrowLeftIcon className="h-4 w-4" />
                    운영 허브로 돌아가기
                </Link>
                {currentLabel ? (
                    <span className="text-sm text-slate-500 dark:text-slate-400">({`/${currentLabel}`})</span>
                ) : null}
            </div>
            <AdminThemeToggle />
        </div>
    );
};

export default AdminPageTopBar;
