import React from "react";
import { Info } from "lucide-react";

export default function InfoHover({ text = "", className = "" }) {
  return (
    <span className={`relative inline-flex items-center group ${className}`}>
      <Info size={14} className="ml-1 text-slate-400 dark:text-slate-400" />
      <span className="pointer-events-none absolute left-1/2 top-full z-20 hidden -translate-x-1/2 whitespace-pre rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-md group-hover:block mt-1 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:shadow-black/50">
        {text}
      </span>
    </span>
  );
}
