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
        <section className="rounded-3xl border border-gray-200 bg-gradient-to-br from-indigo-500/5 to-white p-6 sm:p-8 shadow-[0_16px_30px_rgba(0,0,0,0.06)]">
            <div className="sm:flex sm:items-center sm:justify-between gap-6">
                <div className="max-w-2xl">
                    <h3 className="text-lg font-bold text-gray-900">{t("newsletter.title")}</h3>
                    <p className="mt-1 text-sm text-gray-600">{t("newsletter.subtitle")}</p>
                </div>
                <form onSubmit={onSubmit} className="mt-4 sm:mt-0 flex gap-2">
                    <input
                        type="email"
                        required
                        placeholder={t("newsletter.placeholder")}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-64 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                        disabled={sent}
                    >
                        {sent ? t("newsletter.done") : t("newsletter.submit")}
                    </button>
                </form>
            </div>
        </section>
    );
}