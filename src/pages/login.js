import React, { Fragment } from "react";
import { Transition } from "@headlessui/react";
import SignInForm from "features/login/signInForm";
import { useNavigate } from "react-router-dom";
import Footer from "../features/footer/footer";

export default function Login() {
    const navigate = useNavigate();

    const navigateToHome = () => {
        navigate("/");
    };

    const navigateToRegister = () => {
        navigate("/agree");
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />
                <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/30 blur-3xl" />
                <div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] translate-x-1/3 translate-y-1/3 rounded-full bg-purple-500/20 blur-3xl" />
            </div>
            <div className="relative z-10 flex min-h-screen flex-col">
                <header className="flex flex-col gap-6 px-6 pt-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-16">
                    <h1
                        onClick={navigateToHome}
                        translate="no"
                        className="cursor-pointer text-center text-3xl font-black tracking-[0.4em] text-white drop-shadow-lg sm:text-4xl lg:text-left"
                    >
                        GRAVIFOX.
                    </h1>
                    <div className="flex flex-1 flex-col items-center justify-end gap-2 text-center text-sm text-slate-200/80 lg:flex-none lg:flex-row lg:justify-end lg:text-right">
                        <span className="font-medium">처음 방문하셨나요?</span>
                        <button
                            type="button"
                            onClick={navigateToRegister}
                            className="rounded-full border border-white/20 bg-white/5 px-5 py-2 font-semibold text-white shadow-lg shadow-indigo-900/20 transition hover:border-white/40 hover:bg-white/10"
                        >
                            지금 바로 가입하기
                        </button>
                    </div>
                </header>

                <main className="flex flex-1 flex-col justify-center gap-16 px-6 pb-16 pt-12 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:pt-10">
                    <section className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-xl lg:text-left">
                        <p className="text-xs font-semibold uppercase tracking-[0.5em] text-indigo-200">Secure Console</p>
                        <h2 className="mt-6 text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
                            통합 인텔리전스로 업무를 더 우아하게 완성하세요
                        </h2>
                        <p className="mt-6 text-base leading-relaxed text-slate-200/80">
                            Gravifox는 데이터를 읽고 해석하며, 팀과 함께 협업할 수 있는 분석 경험을 제공합니다. 로그인하고 맞춤화된 인사이트와 워크플로를 바로 이어가 보세요.
                        </p>
                        <ul className="mt-10 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-1">
                            <li className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                                <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-200">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                </span>
                                <div>
                                    <p className="text-base font-semibold text-white">실시간 보안 모니터링</p>
                                    <p className="mt-2 text-sm text-slate-200/80">중요 이벤트와 알림을 한눈에 확인하고, 팀원과 즉시 공유하세요.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                                <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-200">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-12-6h7.5m-9 12h10.5" />
                                    </svg>
                                </span>
                                <div>
                                    <p className="text-base font-semibold text-white">맞춤형 분석 보드</p>
                                    <p className="mt-2 text-sm text-slate-200/80">역할에 맞게 구성된 대시보드로 필요한 인사이트를 정확히 얻을 수 있어요.</p>
                                </div>
                            </li>
                        </ul>
                    </section>

                    <section className="mx-auto w-full max-w-md lg:max-w-lg">
                        <Transition
                            show
                            as={Fragment}
                            enter="transition duration-1000 ease-in-out transform"
                            enterFrom="translate-y-10 opacity-0 lg:translate-x-16"
                            enterTo="translate-y-0 opacity-100 lg:translate-x-0"
                            leave="transition duration-1000 ease-in-out transform"
                            leaveFrom="translate-y-0 opacity-100"
                            leaveTo="translate-y-10 opacity-0 lg:-translate-x-16"
                            appear={true}
                        >
                            <div>
                                <SignInForm />
                            </div>
                        </Transition>
                    </section>
                </main>

                <div className="mt-auto">
                    <Footer transparent />
                </div>
            </div>
        </div>
    );
}
