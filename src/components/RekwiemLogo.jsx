import React, { forwardRef, useId } from 'react';
import clsx from 'clsx';

const RekwiemLogo = forwardRef(function RekwiemLogo({ variant = 'light', className, ...props }, ref) {
    const gradientId = useId();

    const palette =
        variant === 'dark'
            ? {
                  textStart: '#F4E6C8',
                  textMid: '#D9BC7B',
                  textEnd: '#9F7D45',
              }
            : {
                  textStart: '#0B1B33',
                  textMid: '#1F3A60',
                  textEnd: '#35648B',
              };

    return (
        <svg
            ref={ref}
            viewBox="0 0 260 72"
            role="img"
            aria-label="Rekwiem"
            className={clsx('block h-auto w-auto', className)}
            {...props}
        >
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={palette.textStart} />
                    <stop offset="45%" stopColor={palette.textMid} />
                    <stop offset="100%" stopColor={palette.textEnd} />
                </linearGradient>
            </defs>

            <g transform="translate(6 12)">
                <text
                    x="0"
                    y="42"
                    fontSize="48"
                    fontWeight="500"
                    letterSpacing="6"
                    fill={`url(#${gradientId})`}
                    fontFamily='var(--font-logo, "Playfair Display", "Cormorant Garamond", "Times New Roman", serif)'
                >
                    REKWIEM
                </text>
            </g>
        </svg>
    );
});

export default RekwiemLogo;
