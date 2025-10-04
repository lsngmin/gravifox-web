import React, {useState} from "react";
import LoginErrorMessage from "features/login/loginErrorMessage";
import signupAPI from "features/login/api/signupAPI";

export default function SignUpForm({changeForm}) {
    // 로그인 또는 회원가입 시 발생하는 에러 상태 코드와 에러 메시지를 관리합니다.
    const [errorStatus, setErrorStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    /**
     * 회원가입 API 요청 및 상태 관리를 위한 커스텀 훅입니다.
     *
     * @returns {{
     *   signup: (formState: { email: string, password: string }) => Promise<void>,
     *   error: string | null
     * }} - 회원가입 함수와 에러 메시지를 반환합니다.
     */
    const { signup } = signupAPI();

    const [formState, setFormState] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });

    //이메일 정규식입니다
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 회원가입의 유효성 검사 리스트입니다.
    const validations = [
        {
            valid: formState.email && formState.password && formState.confirmPassword,
            message: "Please fill out all fields",
        },
        {
            valid: emailRegex.test(formState.email),
            message: "Please enter a valid email address",
        },
        {
            valid: formState.password === formState.confirmPassword,
            message: "Passwords do not match. Please check again",
        },
    ];

    /**
     * 회원가입 폼 제출 시 호출 되는 함수로, 입력 값 유효성 검사를 수행한 후
     * 회원가입 API 요청을 signup 메서드에 넘겨줍니다.
     * @async
     * @param e - onSubmit에서 발생하는 Event Object
     * @returns {Promise<void>} - 비동기 작업을 처리하는 함수로, 회원가입 API 요청을 비동기로 처리합니다.
     */
    const handleSubmit = async (e) => {
        // onSubmit 이벤트에서 폼 제출 시, 페이지 리로드를 방지하여 비동기 처리로 로그인 동작을 실행하도록 합니다.
        e.preventDefault();
        // 이전에 발생한 에러 메시지를 초기화하여, 폼을 다시 제출할 때 중복된 에러 메시지가 표시되지 않도록 합니다.
        setErrorStatus(null); setErrorMessage(null);

        for (const check of validations) {
            if (!check.valid) {
                setErrorMessage(check.message);
                setErrorStatus(422);
                return;
            }
        }
        try {
            await signup(formState);
        } catch (error) {
            setErrorStatus(error.status);
            setErrorMessage(error.message);
        }
    };

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
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md border-2 px-2 py-8">
            <form onSubmit={handleSubmit} className="space-y-6 px-10">
                <div>
                    <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">Email address</label>
                    <div className="mt-2">
                        <input
                            id="email"
                            name="email"
                            type="text"
                            autoComplete="email"
                            value={formState.email}
                            onChange={handleInputChange('email')}
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300
                                    placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">Password</label>
                    <div className="mt-2">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            value={formState.password}
                            onChange={handleInputChange('password')}
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300
                                    placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="cPassword" className="block text-sm/6 font-medium text-gray-900">Confirm Password</label>
                    <div className="mt-2">
                        <input
                            id="cPassword"
                            name="cPassword"
                            type="password"

                            autoComplete="current-password"
                            value={formState.confirmPassword}
                            onChange={handleInputChange('confirmPassword')}
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300
                                    placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                    </div>
                </div>
                <div>
                    <button
                        type="submit"
                        className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold
                                text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2
                                    focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >Sign Up</button>
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
            <p className="mt-10 text-center text-sm/6 text-gray-500">
                Back again? {' '}
                <button className="font-semibold text-indigo-600 hover:text-indigo-500" onClick={changeForm}>
                    Log in here
                </button>
            </p>
        </div>
    )
}
