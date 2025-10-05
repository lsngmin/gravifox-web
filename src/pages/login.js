import React from "react";
import SignInForm from "features/login/signInForm";
import Navigation from "features/navigation/navigation";
import Footer from "../features/footer/footer";

export default function Login() {
    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(88,111,255,0.16),transparent_65%),radial-gradient(circle_at_bottom,rgba(30,41,59,0.9),rgba(15,23,42,1))]" />
                <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/25 blur-3xl" />
                <div className="absolute bottom-16 left-10 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />
            </div>

            <div className="relative z-10 flex min-h-screen flex-col">
                <Navigation />

                <main className="flex flex-1 flex-col items-center px-6 pb-20 pt-28 sm:px-8 sm:pt-32 lg:px-12 lg:pt-40">
                    <section className="w-full max-w-xl text-center">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.5em] text-indigo-200/80">Sign in</p>
                        <h1 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl">
                            미래형 Gravifox 콘솔에 접속하세요
                        </h1>
                        <p className="mt-3 text-sm text-slate-200/80">
                            필요한 정보만 입력하고 바로 업무를 이어가세요.
                        </p>
                    </section>

                    <section className="mt-10 w-full max-w-md sm:mt-12">
                        <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-2 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.7)] backdrop-blur-2xl">
                            <SignInForm />
                        </div>
                    </section>
                </main>

                <Footer transparent />
            </div>
        </div>
    );
}
