"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import { CloudUpload, Terminal, AutoAwesomeMotion } from "@mui/icons-material";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const HOW_STEPS = [
    { key: "ingest", icon: CloudUpload, glideKey: "how.steps.upload" },
    { key: "analyze", icon: Terminal, glideKey: "how.steps.api" },
    { key: "respond", icon: AutoAwesomeMotion, glideKey: "how.steps.result" },
];

export default function HowItWorksSection() {
    const { t } = useTranslation("home");
    const prevRef = useRef(null);
    const nextRef = useRef(null);
    const paginationRef = useRef(null);
    const [swiperInstance, setSwiperInstance] = useState(null);

    useEffect(() => {
        if (!swiperInstance) return;

        if (
            prevRef.current &&
            nextRef.current &&
            swiperInstance.params?.navigation &&
            swiperInstance.navigation
        ) {
            swiperInstance.params.navigation.prevEl = prevRef.current;
            swiperInstance.params.navigation.nextEl = nextRef.current;
            swiperInstance.navigation.prevEl = prevRef.current;
            swiperInstance.navigation.nextEl = nextRef.current;
            swiperInstance.navigation.init();
            swiperInstance.navigation.update();
        }

        if (paginationRef.current && swiperInstance.params?.pagination && swiperInstance.pagination) {
            const el = paginationRef.current;
            swiperInstance.params.pagination.el = el;
            swiperInstance.pagination.el = el;
            swiperInstance.pagination.init();
            swiperInstance.pagination.render();
            swiperInstance.pagination.update();
            el.style.position = "static";
            el.style.width = "auto";
        }

        const extraPaginations = swiperInstance.el?.querySelectorAll(".swiper-pagination");
        extraPaginations?.forEach((node) => {
            if (node !== paginationRef.current) node.remove();
        });
    }, [swiperInstance]);

    return (
        <section
            id="how"
            className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/60 to-white py-16 sm:py-20 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950"
        >
            <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-soft-light dark:opacity-60" aria-hidden="true">
                <div className="absolute left-[10%] top-[-5%] h-64 w-64 rounded-full bg-indigo-200 blur-3xl dark:bg-indigo-600/40" />
                <div className="absolute right-[-12%] bottom-[-12%] h-72 w-72 rounded-full bg-purple-200 blur-3xl dark:bg-purple-600/30" />
            </div>

            <div className="relative mx-auto flex max-w-5xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
                <h3 className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500 dark:text-indigo-300">
                    {t("how.eyebrow", "이용방법")}
                </h3>
                <p className="mt-3 text-xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl dark:text-white">
                    {t("how.title", "올리고 나면 바로 시작돼요")}
                </p>
                <p className="mt-4 text-[13px] text-slate-600 sm:text-base md:text-lg dark:text-indigo-100/80">
                    {t("how.subtitle", "다른 일을 하러 가도 분석은 백그라운드에서 계속돼요.")}
                </p>

                <div className="mt-12 w-full">
                    <Swiper
                        modules={[Navigation, Pagination, A11y]}
                        spaceBetween={40}
                        slidesPerView={1}
                        pagination={{
                            clickable: true,
                            bulletClass:
                                "swiper-pagination-bullet border border-indigo-300 bg-white opacity-100 mx-1 dark:border-indigo-500/60 dark:bg-slate-900/80",
                            bulletActiveClass:
                                "swiper-pagination-bullet-active bg-indigo-500 border-indigo-500 dark:bg-indigo-400 dark:border-indigo-400",
                        }}
                        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                        onSwiper={setSwiperInstance}
                        breakpoints={{
                            768: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                        }}
                        className="pb-10"
                    >
                        {HOW_STEPS.map(({ key, icon: Icon, glideKey }) => (
                            <SwiperSlide key={key}>
                                <article className="h-full rounded-3xl border border-indigo-100 bg-white/85 p-8 backdrop-blur sm:p-10 dark:border-indigo-500/30 dark:bg-slate-900/70">
                                    <div className="flex h-full flex-col items-center gap-6">
                                        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-400 text-white shadow-[0_18px_45px_-24px_rgba(79,70,229,0.65)] dark:from-indigo-400 dark:to-indigo-300">
                                            <Icon fontSize="small" />
                                        </span>
                                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                                            {t(`${glideKey}.title`)}
                                        </h4>
                                        <p className="min-h-[4.5rem] text-sm leading-relaxed text-slate-600 dark:text-indigo-100/75">
                                            {t(`${glideKey}.desc`)}
                                        </p>
                                    </div>
                                </article>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
                        <button
                            ref={prevRef}
                            type="button"
                            className="rounded-full border border-indigo-300 bg-white/80 px-3 py-2 text-indigo-500 backdrop-blur transition hover:bg-white dark:border-indigo-500/50 dark:bg-slate-900/70 dark:text-indigo-200"
                        >
                            ‹
                        </button>

                        <div
                            ref={paginationRef}
                            className="custom-pagination flex shrink-0 items-center justify-center !static !w-auto"
                        />

                        <button
                            ref={nextRef}
                            type="button"
                            className="rounded-full border border-indigo-300 bg-white/80 px-3 py-2 text-indigo-500 backdrop-blur transition hover:bg-white dark:border-indigo-500/50 dark:bg-slate-900/70 dark:text-indigo-200"
                        >
                            ›
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
