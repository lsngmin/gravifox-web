import React from "react";
import SignInForm from "features/login/signInForm";
import Navigation from "features/navigation/navigation";
import Footer from "../features/footer/footer";

export default function Login() {
    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.28),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(15,23,42,0.9),_rgba(2,6,23,1))]" />
                <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-2/3 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="absolute right-[12%] top-1/4 h-56 w-56 -translate-y-1/3 rounded-full bg-purple-500/20 blur-3xl" />
            </div>

            <div className="relative z-10 flex min-h-screen flex-col">
                <Navigation />

                <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-28 sm:px-8 lg:px-12">
                    <section className="w-full max-w-xl text-center">
                        <div className="space-y-4">
                            <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
                                미래형 보안 허브에 로그인하세요
                            </h1>
                            <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-200/80 sm:text-base">
                                꼭 필요한 정보만 담은 간결한 화면에서 팀의 자산을 안전하게 이어가요.
                            </p>
                        </div>
                    </section>

                    <section className="mt-12 w-full max-w-md">
                        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-[0_24px_60px_-30px_rgba(79,70,229,0.55)] backdrop-blur">
                            <SignInForm />
                        </div>
                    </section>
                </main>

                <Footer transparent />
            </div>
        </div>
    );
}
