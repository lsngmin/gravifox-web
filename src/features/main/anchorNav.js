import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PlayIcon,
  SparklesIcon,
  Squares2X2Icon,
  BriefcaseIcon,
  RectangleStackIcon,
  CodeBracketIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

export default function AnchorNav() {
  const { t } = useTranslation('home');
  const iconMap = {
    how: PlayIcon,
    value: SparklesIcon,
    feature: Squares2X2Icon,
    'use-cases': BriefcaseIcon,
    supported: RectangleStackIcon,
    sample: CodeBracketIcon,
    security: ShieldCheckIcon,
    faq: QuestionMarkCircleIcon,
    testimonials: ChatBubbleLeftRightIcon,
  };
  const items = useMemo(() => ([
    { id: 'how', label: t('anchor.how', 'How it works') },
    { id: 'value', label: t('anchor.value', 'Why Gravifox') },
    { id: 'feature', label: t('anchor.feature', 'Features') },
    { id: 'use-cases', label: t('anchor.useCases', 'Use cases') },
    { id: 'supported', label: t('anchor.supported', 'Formats') },
    { id: 'sample', label: t('anchor.sample', 'Sample') },
    { id: 'security', label: t('anchor.security', 'Security') },
    { id: 'faq', label: t('anchor.faq', 'FAQ') },
    { id: 'testimonials', label: t('anchor.testimonials', 'Stories') },
  ]), [t]);

  const [active, setActive] = useState(items[0].id);
  const navRef = useRef(null);
  const [headerOffset, setHeaderOffset] = useState(64);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 }
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [items]);

  useEffect(() => {
    let ticking = false;
    const measure = () => {
      const header = document.querySelector('header');
      if (!header) {
        setHeaderOffset(64);
        return;
      }
      const rect = header.getBoundingClientRect();
      // offset = current top distance + height + small gap
      const off = Math.max(0, Math.round(rect.top)) + Math.ceil(rect.height) + 8;
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

  const onClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    // Compute dynamic offset: header (fixed) + anchor nav (sticky) heights
    const header = document.querySelector('header');
    const headerRect = header ? header.getBoundingClientRect() : { top: 0, height: 64 };
    const headerH = (headerRect?.top || 0) + (headerRect?.height || 64) + 8;
    const anchorH = navRef.current ? navRef.current.getBoundingClientRect().height : 48;
    const extra = 12; // tighter breathing room since header shrinks more
    const y = el.getBoundingClientRect().top + window.scrollY - (headerH + anchorH + extra);
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <nav
      ref={navRef}
      id="anchor-nav"
      className="sticky z-20 hidden border-b border-slate-200 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/60 lg:block"
      style={{ top: headerOffset }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ul className="flex items-center gap-2 py-3 text-sm overflow-x-auto no-scrollbar">
          {items.map((it) => {
            const Icon = iconMap[it.id] || PlayIcon;
            const isActive = active === it.id;
            return (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={(e) => onClick(e, it.id)}
                  className={`relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="font-medium">{it.label}</span>
                  {isActive && (
                    <span className="pointer-events-none absolute -bottom-1 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-indigo-500" />
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
