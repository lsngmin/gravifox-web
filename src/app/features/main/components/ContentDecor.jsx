import { useEffect, useRef } from "react";

const STYLE_ID = "content-decor-transitions";

export default function ContentDecor({ children }) {
    const styleInjectedRef = useRef(false);

    useEffect(() => {
        if (styleInjectedRef.current || typeof document === "undefined") return;

        if (!document.getElementById(STYLE_ID)) {
            const style = document.createElement("style");
            style.id = STYLE_ID;
            style.textContent = `
                @keyframes decor-flow {
                  0% { background-position: 200% 0; }
                  100% { background-position: -200% 0; }
                }
                @keyframes decor-pulse {
                  0% { opacity: 0.10; transform: translateY(0px) scale(1); }
                  50% { opacity: 0.18; transform: translateY(-6px) scale(1.02); }
                  100% { opacity: 0.12; transform: translateY(0px) scale(1); }
                }
                @media (prefers-reduced-motion: reduce) {
                  .decor-animate, .decor-pulse { animation: none !important; }
                  .decor-fade { transition: none !important; }
                }
                .glass-surface {
                  background: rgba(255,255,255,0.36);
                  -webkit-backdrop-filter: saturate(140%) blur(16px);
                  backdrop-filter: saturate(140%) blur(16px);
                  box-shadow: inset 0 1px 0 rgba(255,255,255,0.5);
                }
                .dark .glass-surface {
                  background: rgba(15,23,42,0.55);
                  box-shadow: inset 0 1px 0 rgba(148,163,184,0.12);
                }
            `;
            document.head.appendChild(style);
        }

        styleInjectedRef.current = true;
    }, []);

    return (
        <div className="relative isolate decor-fade transition-colors duration-700 ease-out glass-surface">
            <div aria-hidden className="absolute inset-0 -z-10">
                <div className="absolute inset-0">
                    <div
                        className="absolute inset-0 block dark:hidden"
                        style={{
                            background:
                                "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(238,242,255,0.76) 45%, rgba(199,210,254,0.24) 100%)",
                        }}
                    />
                    <div
                        className="absolute inset-0 hidden dark:block"
                        style={{
                            background:
                                "linear-gradient(180deg, rgba(12,18,32,0.96) 0%, rgba(17,24,39,0.9) 45%, rgba(15,23,42,0.78) 100%)",
                        }}
                    />
                </div>
                <div className="absolute inset-0">
                    <div
                        className="absolute inset-0 decor-pulse block dark:hidden"
                        style={{
                            backgroundImage: [
                                "radial-gradient(100rem 40rem at 120% -10%, rgba(99,102,241,0.08), transparent)",
                                "radial-gradient(90rem 36rem at -10% 0%, rgba(168,85,247,0.06), transparent)",
                                "radial-gradient(85rem 36rem at 50% 140%, rgba(99,102,241,0.03), transparent)",
                            ].join(","),
                        }}
                    />
                    <div
                        className="absolute inset-0 hidden decor-pulse dark:block"
                        style={{
                            backgroundImage: [
                                "radial-gradient(110rem 48rem at 115% -5%, rgba(99,102,241,0.22), transparent)",
                                "radial-gradient(100rem 40rem at -15% 5%, rgba(147,51,234,0.16), transparent)",
                                "radial-gradient(90rem 36rem at 50% 140%, rgba(59,130,246,0.12), transparent)",
                            ].join(","),
                        }}
                    />
                </div>
                <div
                    className="absolute inset-0 pointer-events-none decor-animate"
                    style={{
                        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.24) 45%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.24) 55%, transparent 100%)",
                        backgroundSize: "200% 100%",
                        animation: "decor-flow 14s linear infinite",
                        opacity: 0.06,
                    }}
                />
            </div>
            {children}
        </div>
    );
}
