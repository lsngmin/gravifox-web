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

                <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-28 sm:px-8 sm:pt-32 lg:px-12">
                    <section className="w-full max-w-xl space-y-6 text-center lg:space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">콘솔 로그인</h1>
                            <p className="text-sm leading-relaxed text-slate-200/80 sm:text-base">
                                팀 인증을 완료하고 작업을 계속하세요.
                            </p>
                        </div>
                    </section>

                    <section className="mt-12 w-full max-w-md sm:mt-14">
                        <SignInForm />
                    </section>
                </main>

                <Footer transparent />
            </div>
        </div>
    );
}
