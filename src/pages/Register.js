import React from "react";
import {useNavigate} from "react-router-dom";
import RegisterBox from "../features/register/components/registerBox";

export default function Register() {
    const navigate = useNavigate();
    const navigateToHome = () => {
        navigate("/");
    }

    return (
        <div className="p-20 ">
            <div className="mt-14">
                <div className="col-span-2 flex justify-center items-center">
                    <h2 onClick={navigateToHome} translate="no" className="cursor-pointer select-none text-[clamp(28px,5vw,60px)]
                    font-extrabold tracking-tight leading-none text-indigo-500 drop-shadow-md mb-12">
                        GRAVIFOX.
                    </h2>
                </div>
                <RegisterBox/>
            </div>
        </div>
    );
}
