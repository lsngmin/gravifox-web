import React from 'react';

export default function SectionDecor({ position = 'top' }) {
  const isTop = position === 'top';
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -z-10">
      <div
        className={`${isTop ? 'top-0' : 'bottom-0'} h-28 sm:h-36 w-full bg-gradient-to-b from-white/80 via-white/60 to-transparent`}
      />
      <div
        className={`absolute inset-0 ${isTop ? '' : ''}`}
        style={{
          backgroundImage:
            isTop
              ? 'radial-gradient(36rem 14rem at 10% -20%, rgba(99,102,241,0.08), transparent), radial-gradient(28rem 12rem at 90% -10%, rgba(168,85,247,0.06), transparent)'
              : 'radial-gradient(36rem 14rem at 90% 120%, rgba(99,102,241,0.06), transparent), radial-gradient(28rem 12rem at 10% 110%, rgba(168,85,247,0.05), transparent)'
        }}
      />
    </div>
  );
}
