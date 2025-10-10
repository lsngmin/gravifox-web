import clsx from 'clsx';

const variantClassMap = {
    default: '',
    subtle: 'bg-gradient-to-b from-white via-slate-50/60 to-white',
    surface: 'bg-white',
    outlined: 'border-y border-slate-200/80 bg-white/95 backdrop-blur',
    inverted:
        "text-slate-100 before:absolute before:inset-0 before:-z-10 before:bg-slate-950 before:content-[''] after:absolute after:inset-0 after:-z-10 after:bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.35),_transparent_65%)] after:content-['']",
};

const widthClassMap = {
    default: 'mx-auto w-full max-w-7xl px-6 lg:px-8',
    medium: 'mx-auto w-full max-w-6xl px-6 lg:px-8',
    narrow: 'mx-auto w-full max-w-5xl px-6',
    tight: 'mx-auto w-full max-w-4xl px-6',
};

const alignClassMap = {
    center: 'text-center',
    left: 'text-left',
};

const themeClassMap = {
    light: {
        eyebrow: 'text-indigo-500',
        title: 'text-slate-900',
        description: 'text-slate-600',
    },
    dark: {
        eyebrow: 'text-indigo-200',
        title: 'text-white',
        description: 'text-indigo-100/90',
    },
    emerald: {
        eyebrow: 'text-emerald-500',
        title: 'text-slate-900',
        description: 'text-slate-600',
    },
};

export function SectionContainer({
    as: Component = 'section',
    id,
    variant = 'default',
    width = 'default',
    padded = true,
    className,
    children,
    ...rest
}) {
    return (
        <Component
            id={id}
            className={clsx(
                'relative isolate overflow-hidden',
                padded && 'py-16 sm:py-20',
                variantClassMap[variant],
                className
            )}
            {...rest}
        >
            <div className={clsx('relative z-10', widthClassMap[width])}>{children}</div>
        </Component>
    );
}

export function SectionHeader({
    eyebrow,
    title,
    description,
    align = 'center',
    theme = 'light',
    className,
    eyebrowClassName,
    titleClassName,
    descriptionClassName,
    kicker,
}) {
    const resolvedTheme = themeClassMap[theme] || themeClassMap.light;
    const wrapperAlign = alignClassMap[align] || alignClassMap.center;

    return (
        <div className={clsx('mx-auto space-y-3 sm:space-y-4', wrapperAlign, className)}>
            {eyebrow ? (
                <p
                    className={clsx(
                        'text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em]',
                        resolvedTheme.eyebrow,
                        eyebrowClassName
                    )}
                >
                    {eyebrow}
                </p>
            ) : null}

            {title ? (
                <h2
                    className={clsx(
                        'text-xl sm:text-3xl md:text-4xl font-bold tracking-tight',
                        resolvedTheme.title,
                        align === 'center' ? 'mx-auto max-w-3xl' : 'max-w-3xl',
                        titleClassName
                    )}
                >
                    {title}
                </h2>
            ) : null}

            {description ? (
                <p
                    className={clsx(
                        'text-[13px] sm:text-base md:text-lg leading-relaxed',
                        resolvedTheme.description,
                        align === 'center' ? 'mx-auto max-w-3xl' : 'max-w-2xl',
                        descriptionClassName
                    )}
                >
                    {description}
                </p>
            ) : null}

            {kicker ? (
                <div className="flex justify-center text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
                    {kicker}
                </div>
            ) : null}
        </div>
    );
}

export function SectionSurface({ className, children }) {
    return (
        <div className={clsx('relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur', className)}>
            {children}
        </div>
    );
}

export function SectionStack({ className, ...rest }) {
    return <div className={clsx('mt-10 space-y-6', className)} {...rest} />;
}

export function SectionGrid({ className, ...rest }) {
    return <div className={clsx('mt-10 grid gap-6', className)} {...rest} />;
}
