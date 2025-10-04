import React, {useState} from "react";

import LoginErrorMessage from "features/login/loginErrorMessage";
import SignInAPI from "features/login/api/signInAPI";
import GoogleLoginButton from "features/login/components/googleLoginButton"
import {Link, useNavigate} from "react-router-dom";
export default function SignInForm() {
    const navigate = useNavigate();

    // LoginErrorMessage에 전달하기 위한 에러 코드와 메세지
    const [errorStatus, setErrorStatus] = useState(null),
        [errorMessage, setErrorMessage] = useState(null),
        {signIn} = SignInAPI(),
        [formState, setFormState] = useState({
            userId: '',
            password: ''
        });
    /**
     * 로그인 폼 제출시 처리되는 함수입니다. 로그인 요청을 signIn으로 전달하며 입력값은 formstate 입니다.
     * @async
     * @param e - onSubmit에서 발생하는 event
     * @returns {Promise<void>} - 로그인 요청을 비동기로 처리합니다.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signIn(formState)
        } catch (error) {
            if (error?.code === 'EMAIL_NOT_VERIFIED') {
                navigate('/verify', { state: { email: formState.userId } });
                return;
            }
            setErrorStatus(error.status);
            setErrorMessage(error.message);
        }
    }
    const handleChangeForm = () => {
        navigate("/agree")
    }

    /**
     * 입력 필드의 변경을 처리하는 함수입니다.
     *
     * 커링(Currying)된 형태로, 특정 입력 필드의 이름(`field`)을 받아 해당 필드의 값을 업데이트
     * 사용자 입력이 변경될 때마다 `formState`를 갱신, 이전 에러 메세지 초기화
     *
     * @param {String} field - 업데이트할 폼 필드의 이름 (ex -> 'email', 'password')
     * @returns {(event: React.ChangeEvent<HTMLInputElement>) => void} - 이벤트 핸들러 함수
     */
    const handleInputChange = (field) => (event) => {
        setFormState((prev) => ({
            ...prev,
            [field]: event.target.value,
        }));
        // 이전에 발생한 에러 메시지를 초기화하여, 폼을 다시 제출할 때 중복된 에러 메시지가 표시되지 않도록 합니다.
    };

    return (
        <div className="mx-auto w-full min-w-96 border px-4 py-8 rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6 px-10">
                <div>
                    <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                        Email address
                    </label>
                    <div className="mt-2">
                        <input
                            id="userId"
                            name="userId"
                            type="text"
                            autoComplete="email"
                            value={formState.userId}
                            onChange={handleInputChange("userId")}
                            className=" block w-[22rem] rounded-md bg-white px-3 py-4 text-base text-gray-900
                            outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400
                            focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                            Password
                        </label>
                        <div className="text-sm">
                            <Link to="/support" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                Forgot password?
                            </Link>
                        </div>
                    </div>
                    <div className="mt-2">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            value={formState.password}
                            onChange={handleInputChange('password')}
                            className="block w-full rounded-md bg-white px-3 py-4 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-4 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Sign in
                    </button>
                </div>
                <div>
                    <LoginErrorMessage
                        status={errorStatus}
                        message={errorMessage}
                        onClose={() => {
                            setErrorStatus(null);
                            setErrorMessage(null);
                        }}
                    />
                </div>
            </form>

            <div className="relative my-8 flex w-full items-center">
                <div className="flex-1 border-gray-500 border-t-2 border-dotted ml-10"/>
                <span className="bg-white px-4 font-medium text-gray-500">OR</span>
                <div className="flex-1 border-gray-500 border-t-2 border-dotted mr-10"/>
            </div>
            <div className="mx-10">
                <GoogleLoginButton/>
            </div>
            <p className="mt-10 text-center text-sm/6 text-gray-500">
                Not a member yet? {' '}
                <button className="font-semibold text-indigo-600 hover:text-indigo-500" onClick={handleChangeForm}>
                    Register Now
                </button>
            </p>
        </div>
    )
}
