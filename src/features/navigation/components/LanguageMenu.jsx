import { Disclosure, Transition } from "@headlessui/react";
import { GlobeAltIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

function LanguageMenu({ language, changeLanguage }) {
    const [showMore, setShowMore] = useState(false);

    return (
        <Disclosure>
            {({ open }) => (
                <>
                    <Disclosure.Button
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                        <GlobeAltIcon className="w-5 h-5 text-indigo-500" />
                        Language
                        <ChevronDownIcon
                            className={`ml-auto h-4 w-4 transition-transform duration-300 ${
                                open ? "rotate-180" : ""
                            }`}
                        />
                    </Disclosure.Button>

                    <Transition
                        enter="transition duration-200 ease-out"
                        enterFrom="opacity-0 -translate-y-1 scale-95"
                        enterTo="opacity-100 translate-y-0 scale-100"
                        leave="transition duration-150 ease-in"
                        leaveFrom="opacity-100 translate-y-0 scale-100"
                        leaveTo="opacity-0 -translate-y-1 scale-95"
                    >
                        <Disclosure.Panel className="ml-10 flex flex-col gap-1 py-2">
                            {/* 기본 2개 언어 */}
                            <button
                                onClick={() => changeLanguage("en")}
                                className={`text-left text-sm rounded-md px-2 py-1.5 tracking-wide transition ${
                                    language === "en"
                                        ? "font-semibold text-indigo-600 bg-indigo-50"
                                        : "text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                English
                            </button>
                            <button
                                onClick={() => changeLanguage("ko")}
                                className={`text-left text-sm rounded-md px-2 py-1.5 tracking-wide transition ${
                                    language === "ko"
                                        ? "font-semibold text-indigo-600 bg-indigo-50"
                                        : "text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                한국어
                            </button>

                            {/* 확장 버튼 */}
                            {!showMore && (
                                <button
                                    onClick={() => setShowMore(true)}
                                    className="text-left text-xs italic text-gray-500 hover:text-indigo-600 mt-1"
                                >
                                    + More languages
                                </button>
                            )}

                            {/* 추가 언어 (More 클릭 시 표시) */}
                            {showMore && (
                                <>
                                    <button
                                        onClick={() => changeLanguage("jp")}
                                        className={`text-left text-sm rounded-md px-2 py-1.5 tracking-wide transition ${
                                            language === "jp"
                                                ? "font-semibold text-indigo-600 bg-indigo-50"
                                                : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        日本語
                                    </button>
                                    <button
                                        onClick={() => changeLanguage("zh")}
                                        className={`text-left text-sm rounded-md px-2 py-1.5 tracking-wide transition ${
                                            language === "zh"
                                                ? "font-semibold text-indigo-600 bg-indigo-50"
                                                : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        中文
                                    </button>
                                    <button
                                        onClick={() => changeLanguage("es")}
                                        className={`text-left text-sm rounded-md px-2 py-1.5 tracking-wide transition ${
                                            language === "es"
                                                ? "font-semibold text-indigo-600 bg-indigo-50"
                                                : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        Español
                                    </button>
                                </>
                            )}
                        </Disclosure.Panel>
                    </Transition>
                </>
            )}
        </Disclosure>
    );
}

export default LanguageMenu;
