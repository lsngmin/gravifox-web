import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const PROGRESS_SECTIONS = Object.freeze([
    "how",
    "feature",
    "use-cases",
    "supported",
    "sample",
    "security",
    "faq",
]);

export default function AnchorNav() {
    const { t } = useTranslation("home");
    const sectionIds = useMemo(() => PROGRESS_SECTIONS, []);
    const [progress, setProgress] = useState(0);
    const [headerOffset, setHeaderOffset] = useState(72);
    const [displayProgress, setDisplayProgress] = useState(0);
    const animationRef = useRef(null);

    useEffect(() => {
        const measure = () => {
            if (typeof window === "undefined") return;
            const header = document.querySelector("header");
            const baseGap = window.innerWidth < 1024 ? 12 : 8;
            if (!header) {
                setHeaderOffset(64 + baseGap);
                return;
            }
            const rect = header.getBoundingClientRect();
            const offset =
                Math.max(0, Math.round(rect.top)) + Math.ceil(rect.height) + baseGap;
            setHeaderOffset(offset);
        };

        const onScroll = () => {
            if (typeof window === "undefined") return;
            window.requestAnimationFrame(measure);
        };

        measure();
        window.addEventListener("resize", measure);
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            window.removeEventListener("resize", measure);
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        let animationFrame = null;

        const calculateProgress = () => {
            const elements = sectionIds
                .map((id) => document.getElementById(id))
                .filter(Boolean);

            if (!elements.length) {
                setProgress(0);
                return;
            }

            const firstRect = elements[0].getBoundingClientRect();
            const lastRect = elements[elements.length - 1].getBoundingClientRect();
            const firstTop = firstRect.top + window.scrollY;
            const lastBottom = lastRect.bottom + window.scrollY;
            const range = lastBottom - window.innerHeight - firstTop;

            if (range <= 0) {
                const reachedEnd = window.scrollY + window.innerHeight >= lastBottom;
                setProgress(reachedEnd ? 1 : 0);
                return;
            }

            const raw = (window.scrollY - firstTop) / range;
            const clamped = Math.min(1, Math.max(0, raw));
            setProgress(clamped);
        };

        const handle = () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            animationFrame = window.requestAnimationFrame(calculateProgress);
        };

        calculateProgress();
        window.addEventListener("scroll", handle, { passive: true });
        window.addEventListener("resize", handle);

        return () => {
            if (animationFrame) cancelAnimationFrame(animationFrame);
            window.removeEventListener("scroll", handle);
            window.removeEventListener("resize", handle);
        };
    }, [sectionIds]);

    useEffect(() => {
        const step = () => {
            setDisplayProgress((prev) => {
                const diff = progress - prev;
                if (Math.abs(diff) < 0.002) {
                    animationRef.current = null;
                    return progress;
                }
                const next = prev + diff * 0.15;
                animationRef.current = window.requestAnimationFrame(step);
                return next;
            });
        };

        if (animationRef.current) {
            window.cancelAnimationFrame(animationRef.current);
        }
        animationRef.current = window.requestAnimationFrame(step);

        return () => {
            if (animationRef.current) {
                window.cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    }, [progress]);

    const clampedProgress = Math.min(1, Math.max(0, displayProgress));
    const progressValue = Math.round(clampedProgress * 100);

    return (
        <nav
            id="anchor-nav"
            className="sticky z-30 w-full border-b border-indigo-200/70 bg-gradient-to-b from-white via-slate-50/60 to-white backdrop-blur-md transition-colors duration-300 dark:border-slate-800/80 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950"
            style={{ top: headerOffset }}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="py-4">
                    <div
                        className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200/90 dark:bg-slate-800/80"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progressValue}
                        aria-label={t("anchor.progressLabel", "Scroll progress")}
                    >
                        <div
                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600 shadow-[0_0_16px_rgba(99,102,241,0.35)]"
                            style={{ width: `${clampedProgress * 100}%` }}
                            aria-hidden="true"
                        />
                    </div>
                </div>
            </div>
        </nav>
    );
}
