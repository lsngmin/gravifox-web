import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function AnchorNav() {
  const { t } = useTranslation('home');
  const sectionIds = useMemo(
    () => ['how', 'feature', 'use-cases', 'supported', 'sample', 'security', 'faq'],
    []
  );
  const [progress, setProgress] = useState(0);
  const [headerOffset, setHeaderOffset] = useState(72);

  useEffect(() => {
    let ticking = false;
    const measure = () => {
      const header = document.querySelector('header');
      const baseGap = window.innerWidth < 1024 ? 12 : 8;
      if (!header) {
        setHeaderOffset(64 + baseGap);
        return;
      }
      const rect = header.getBoundingClientRect();
      // offset = current top distance + height + small gap
      const off = Math.max(0, Math.round(rect.top)) + Math.ceil(rect.height) + baseGap;
      setHeaderOffset(off);
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          measure();
          ticking = false;
        });
        ticking = true;
      }
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
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
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(calculateProgress);
    };

    calculateProgress();
    window.addEventListener('scroll', handle, { passive: true });
    window.addEventListener('resize', handle);
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', handle);
      window.removeEventListener('resize', handle);
    };
  }, [sectionIds]);

  return (
    <nav
      id="anchor-nav"
      className="sticky z-20 w-full border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70"
      style={{ top: headerOffset }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:gap-4">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {t('anchor.progressLabel', 'Scroll progress')}
          </div>
          <div className="flex flex-1 items-center gap-3">
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-200/80">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600 transition-[width] duration-200"
                style={{ width: `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%` }}
                aria-hidden="true"
              />
            </div>
            <div className="text-xs font-medium text-slate-600">
              {`${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%`}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
