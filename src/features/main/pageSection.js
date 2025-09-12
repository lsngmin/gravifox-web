export default function PageSection() {
    return (
        <div className="">
            <div className="relative isolate px-6 mt-[-30px] lg:px-8">
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-20 -z-10 transform-gpu overflow-hidden blur-3xl sm:top-20 pointer-events-none"
                >
                    <div
                        style={{
                            clipPath:
                                'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
                        }}
                        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[12deg] bg-gradient-to-tr from-[#0ea5e9] to-[#7dd3fc] opacity-25 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                    />
                </div>
                <div className="mx-auto max-w-4xl py-16 sm:py-24 lg:py-32">
                    <div className="hidden sm:mb-8 sm:flex sm:justify-center">
                        <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                            Have a question or partnership idea? Let's talk &nbsp;{' '}
                            <a href="#" className="font-semibold text-indigo-600">
                                <span aria-hidden="true" className="absolute inset-0" />
                                Contact Us <span aria-hidden="true">&rarr;</span>
                            </a>
                        </div>
                    </div>
                    <div className="text-center">
                        <h1 className="text-slate-900 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-center dark:text-white">
                            Fast insights, zero setup.<br/>
                            Plug into our AI API and go.
                        </h1>
                        <p className="mt-6 text-lg text-slate-600 text-center max-w-3xl mx-auto dark:text-slate-400">
                            Turn data into decisions in seconds — no ML expertise required<br/>
                            Our endpoints handle the heavy lifting.
                        </p>

                        <div className="mt-10 flex items-center justify-center">
                            <a
                                href="/analyze"
                                className="rounded-xl bg-sky-400/80 backdrop-blur-sm px-8 py-4 text-base font-semibold text-white ring-1 ring-sky-300/50 shadow-lg shadow-sky-200/50 hover:bg-sky-300/90 hover:shadow-sky-200/60 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400/50 transition-all duration-200"
                            >
                                Get Started for Free
                            </a>
                            {/*<a href="#" className="text-sm/6 font-semibold text-gray-900">*/}
                            {/*    Give Feedback <span aria-hidden="true">→</span>*/}
                            {/*</a>*/}
                        </div>
                    </div>
                </div>
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
                >
                    <div
                        style={{
                            clipPath:
                                'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
                        }}
                        className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[-12deg] bg-gradient-to-tr from-[#0ea5e9] to-[#7dd3fc] opacity-25 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                    />
                </div>
            </div>
        </div>
    )
}
