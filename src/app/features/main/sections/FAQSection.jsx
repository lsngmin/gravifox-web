"use client";

import { useTranslation } from "react-i18next";
import Footer from "../../../layout/Footer/Footer";
import { Disclosure } from "@headlessui/react";
import { Add as PlusIcon, Remove as MinusIcon } from "@mui/icons-material";

const DEFAULT_FAQ = [
    {
        q: "How accurate is detection?",
        a: "We tune on real-world datasets and continuously improve.",
    },
    {
        q: "How fast is the API?",
        a: "Most responses arrive within a few seconds.",
    },
    {
        q: "What formats do you support?",
        a: "Common video and image formats including MP4, MOV, JPG, and PNG.",
    },
    {
        q: "Is there a free trial?",
        a: "Yes. Start free and upgrade as you grow.",
    },
];

export default function FAQSection() {
    const { t } = useTranslation("home");
    const items = t("faq.items", { returnObjects: true, defaultValue: DEFAULT_FAQ }) || DEFAULT_FAQ;

    return (
        <section
            id="faq"
            className="relative isolate overflow-hidden bg-white py-16 sm:py-20 dark:bg-slate-950"
        >
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),_transparent_65%)] dark:bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.28),_transparent_65%)]"
                aria-hidden="true"
            />
            <div className="relative mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-indigo-500 sm:text-xs dark:text-indigo-300">
                        {t("faq.eyebrow", "자주 묻는 질문")}
                    </h3>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl lg:text-5xl dark:text-white">
                        {t("faq.title", "자주 묻는 질문에 대한 답변")}
                    </p>
                </div>

                <div className="mt-12 grid gap-4">
                    {items.map((item, idx) => (
                        <Disclosure key={idx}>
                            {({ open }) => (
                                <article className="relative overflow-hidden rounded-3xl border border-indigo-100/70 bg-white/85 px-5 py-4 shadow-lg shadow-indigo-100/40 backdrop-blur transition hover:-translate-y-1.5 hover:shadow-2xl dark:border-indigo-500/30 dark:bg-slate-900/70 dark:shadow-indigo-900/30">
                                    <div className="absolute inset-0 bg-gradient-to-r from-white via-indigo-50/70 to-white dark:from-slate-900 dark:via-indigo-500/10 dark:to-slate-950" aria-hidden="true" />
                                    <div className="relative">
                                        <Disclosure.Button className="flex w-full items-center justify-between gap-4 text-left">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
                                                    {t("faq.stepLabel", "Topic")} {idx + 1}
                                                </span>
                                                <span className="text-base font-semibold text-slate-900 sm:text-lg dark:text-white">
                                                    {item.q}
                                                </span>
                                            </div>
                                            <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-indigo-200/60 bg-white/80 text-indigo-500 shadow-sm dark:border-indigo-500/30 dark:bg-slate-900/70 dark:text-indigo-200">
                                                {open ? <MinusIcon fontSize="small" /> : <PlusIcon fontSize="small" />}
                                            </span>
                                        </Disclosure.Button>
                                        <Disclosure.Panel className="mt-4 rounded-2xl border border-indigo-100/60 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-inner shadow-indigo-200/40 dark:border-indigo-500/30 dark:bg-slate-900/60 dark:text-indigo-100/80">
                                            {item.a}
                                        </Disclosure.Panel>
                                    </div>
                                </article>
                            )}
                        </Disclosure>
                    ))}
                </div>
                <div className="mt-16">
                    <Footer />
                </div>
            </div>
        </section>
    );
}
