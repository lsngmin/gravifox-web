import React, { useEffect, useMemo, useRef, useState } from "react";

export default function Typewriter({
  text = "",
  speed = 30, // ms per character
  startDelay = 0,
  className = "text-sm text-slate-600",
  showCaret = true,
  onceKey = null, // if provided, run only once per browser (localStorage)
  onDone = null, // optional callback when typing finishes
}) {
  const [idx, setIdx] = useState(0);
  const [skipAnim, setSkipAnim] = useState(false);
  const doneRef = useRef(false);
  const reduced = useMemo(() =>
    typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  , []);
  const timerRef = useRef(null);

  // Read once flag
  useEffect(() => {
    if (!onceKey) return;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const played = window.localStorage.getItem(onceKey) === "1";
        if (played) {
          setSkipAnim(true);
          setIdx(text.length);
          if (!doneRef.current && typeof onDone === 'function') {
            // If we skip, fire onDone immediately
            doneRef.current = true;
            try { onDone(); } catch {}
          }
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onceKey]);

  useEffect(() => {
    if (reduced || skipAnim) {
      setIdx(text.length);
      if (!doneRef.current && typeof onDone === 'function') {
        doneRef.current = true;
        try { onDone(); } catch {}
      }
      return;
    }
    let cancelled = false;
    let finishedNotified = false;
    const start = () => {
      let i = 0;
      timerRef.current = setInterval(() => {
        i += 1;
        if (cancelled) return;
        setIdx((prev) => {
          const next = Math.min(text.length, prev + 1);
          if (next === text.length && timerRef.current) {
            clearInterval(timerRef.current);
          }
          return next;
        });
        if (i >= text.length && timerRef.current) {
          clearInterval(timerRef.current);
          if (!finishedNotified && !doneRef.current && typeof onDone === 'function') {
            finishedNotified = true;
            doneRef.current = true;
            try { onDone(); } catch {}
          }
        }
      }, Math.max(10, speed));
    };
    const delayId = setTimeout(start, Math.max(0, startDelay));
    return () => {
      cancelled = true;
      clearTimeout(delayId);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, speed, startDelay, reduced, skipAnim, onDone]);

  // Persist once flag when finished
  useEffect(() => {
    if (!onceKey) return;
    if (idx >= text.length) {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(onceKey, "1");
        }
      } catch {}
    }
  }, [idx, text.length, onceKey]);

  const visible = text.slice(0, idx);
  const isDone = idx >= text.length;

  return (
    <p className={className}>
      {visible}
      {showCaret && !isDone && (
        <span
          aria-hidden
          className="inline-block ml-1 h-[1em] w-[2px] translate-y-[2px] bg-slate-500 opacity-80 animate-pulse"
        />
      )}
    </p>
  );
}
