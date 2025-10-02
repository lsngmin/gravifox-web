import React from 'react';

export default function MainText() {
    return (
        <section className="relative isolate overflow-hidden bg-transparent px-6 pb-12 sm:pt-10 sm:pb-14 lg:px-8">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(20rem_8rem_at_top,theme(colors.indigo.100)_30%,white)] opacity-30" />
            <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white/70 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />
            <div className="mx-auto max-w-2xl lg:max-w-4xl">

                <figure className="mt-6">
                    <blockquote className="text-center text-xl/8 font-semibold text-gray-900 sm:text-2xl/9">
                        <p>
                            "Add instant image analysis to your app—no complex AI deployment or infrastructure required with Gravifox API."
                        </p>
                    </blockquote>
                    <figcaption className="mt-8">

                        <div className="mt-4 flex items-center justify-center space-x-3 text-base">
                            <div className="font-semibold text-gray-900">GraviFox</div>
                            <svg width={3} height={3} viewBox="0 0 2 2" aria-hidden="true" className="fill-gray-900">
                                <circle r={1} cx={1} cy={1} />
                            </svg>
                            <div className="text-gray-600">AI API Solution</div>
                        </div>
                    </figcaption>
                </figure>
            </div>
        </section>
    );
}
