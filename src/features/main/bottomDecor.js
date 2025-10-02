import React from 'react';

export default function BottomDecor() {
  return (
    <div aria-hidden="true" className="relative isolate overflow-hidden">
      <div className="h-40 sm:h-56 bg-gradient-to-b from-white via-white to-indigo-50" />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(50rem 20rem at 100% 120%, rgba(99,102,241,0.12), transparent), radial-gradient(40rem 16rem at 0% 110%, rgba(168,85,247,0.10), transparent)'
        }}
      />
    </div>
  );
}

