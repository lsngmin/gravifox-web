import React, { useState } from "react";
import { useTranslation } from "react-i18next";


export default function NewsletterCTA() {
    const { t } = useTranslation("blog");
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);


    const onSubmit = async e => {
        e.preventDefault();
        try {
// TODO: 실제 API 경로에 맞춰 수정 (/api/newsletter 등)
            await new Promise(res => setTimeout(res, 600));
            setSent(true);
        } catch (e) {}
    };


    return (
        <section className="rounded-3xl border border-indigo-200/40 bg-gradient-to-br from-white via-indigo-50/60 to-white/80 p-6 shadow-[0_16px_30px_rgba(15,23,42,0.08)] transition dark:border-slate-700 dark:from-slate-900 dark:via-slate-900/50 dark:to-slate-950/90 dark:shadow-[0_24px_48px_rgba(2,6,23,0.55)] sm:p-8">
            <div className="sm:flex sm:items-center sm:justify-between gap-6">
                <div className="max-w-2xl">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("newsletter.title")}</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("newsletter.subtitle")}</p>
                </div>
                <form onSubmit={onSubmit} className="mt-4 flex gap-2 sm:mt-0">
                    <input
                        type="email"
                        required
                        placeholder={t("newsletter.placeholder")}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-64 rounded-xl border border-slate-300/80 bg-white/95 px-3 py-2 text-sm text-slate-700 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:ring-indigo-400"
                    />
                    <button
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-400 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                        disabled={sent}
                    >
                        {sent ? t("newsletter.done") : t("newsletter.submit")}
                    </button>
                </form>
            </div>
        </section>
    );
}
