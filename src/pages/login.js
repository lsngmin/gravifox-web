import React from "react";
import SignInForm from "features/login/signInForm";
import Navigation from "features/navigation/navigation";
import Footer from "../features/footer/footer";

export default function Login() {
    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(99,102,241,0.28),transparent_55%),radial-gradient(circle_at_80%_-10%,rgba(56,189,248,0.22),transparent_50%)]" />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 opacity-95" />
                <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/25 blur-3xl" />
            </div>

            <div className="relative z-10 flex min-h-screen flex-col">
                <Navigation />

                <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-28 sm:px-8 sm:pt-32 lg:px-12">
                    <section className="w-full max-w-md">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/20 via-white/10 to-white/5 p-[1px] shadow-[0_25px_80px_-20px_rgba(56,189,248,0.35)]">
                            <div className="relative rounded-[calc(1.5rem-1px)] bg-slate-950/75 px-8 py-10 backdrop-blur-xl sm:px-10 sm:py-12">
                                <div className="pointer-events-none absolute inset-x-10 -top-24 h-40 rounded-full bg-gradient-to-br from-indigo-400/50 via-cyan-300/40 to-transparent blur-3xl" />
                                <div className="absolute inset-0 rounded-[calc(1.5rem-1px)] border border-white/10" />

                                <div className="relative z-10">
                                    <SignInForm />
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <Footer transparent />
            </div>
        </div>
    );
}
