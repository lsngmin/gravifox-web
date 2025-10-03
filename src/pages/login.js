import React, { Fragment } from "react";
import { Transition } from "@headlessui/react";
import SignInForm from "features/login/signInForm";
import {useNavigate} from "react-router-dom";
import Footer from "../features/footer/footer";

export default function Login() {
    const navigate = useNavigate();
    const navigateToHome = () => {
        navigate("/");
    }
    return (
        <div className="p-20 ">
            <div className="mt-14">
                <div className="col-span-2 flex justify-center items-center" >
                    <h2 onClick={navigateToHome} translate="no" className="cursor-pointer select-none text-[clamp(28px,5vw,60px)]
                    font-extrabold tracking-tight leading-none text-indigo-500 drop-shadow-md mb-12">
                        GRAVIFOX.
                    </h2>
                </div>
                <div className="flex flex-1 justify-center items-center">
                    {/* 로그인 폼 */}
                    <Transition
                        show
                        as={Fragment}
                        enter="transition duration-1000 ease-in-out transform"
                        enterFrom="translate-x-full opacity-0"
                        enterTo="translate-x-0 opacity-100"
                        leave="transition duration-1000 ease-in-out transform"
                        leaveFrom="translate-x-0 opacity-100"
                        leaveTo="-translate-x-full opacity-0"
                        appear={true}
                    >
                        <div className="">
                            <SignInForm />
                        </div>
                    </Transition>

                    {/*/!* 회원가입 폼 *!/*/}
                    {/*<Transition*/}
                    {/*    show={showSignUp}*/}
                    {/*    as={Fragment}*/}
                    {/*    enter="transition duration-1000 ease-in-out transform"*/}
                    {/*    enterFrom="-translate-x-full opacity-0"*/}
                    {/*    enterTo="translate-x-0 opacity-100"*/}
                    {/*    leave="transition duration-1000 ease-in-out transform"*/}
                    {/*    leaveFrom="translate-x-0 opacity-100"*/}
                    {/*    leaveTo="translate-x-full opacity-0"*/}
                    {/*    appear={true}*/}
                    {/*>*/}
                    {/*    <div className="absolute w-full">*/}
                    {/*        <SignUpForm changeForm={() => switchToSignIn()} />*/}
                    {/*    </div>*/}
                    {/*</Transition>*/}
                </div>
            </div>
            <Footer />
        </div>
    );
}