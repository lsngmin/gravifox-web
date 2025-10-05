import React from "react";
import SignInForm from "features/login/signInForm";
import Navigation from "features/navigation/navigation";
import Footer from "../features/footer/footer";

export default function Login() {
    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />
                <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/30 blur-3xl" />
                <div className="absolute bottom-10 left-4 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/3 translate-y-1/3 rounded-full bg-purple-500/20 blur-3xl" />
            </div>

            <div className="relative z-10 flex min-h-screen flex-col">
                <Navigation />

                <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-12 sm:px-8 lg:px-12">
                    <section className="w-full max-w-xl space-y-6 text-center lg:space-y-8">
                        <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-indigo-200">Log in</p>
                            <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
                                계정에 접속해 작업을 이어가세요
                            </h1>
                            <p className="text-sm leading-relaxed text-slate-200/80 sm:text-base">
                                Gravifox 보안 콘솔에 로그인하고 팀의 프로젝트와 데이터를 한곳에서 관리하세요.
                            </p>
                        </div>
                    </section>

                    <section className="mt-10 w-full max-w-md sm:mt-12">
                        <SignInForm />
                    </section>
                </main>

                <Footer transparent />
            </div>
        </div>
    );
}
