import {useAuth} from "providers/authProvider";
import axios from "axios";
import {useLocation, useNavigate} from "react-router-dom";
import {AUTH_ENDPOINTS} from "../../../api/endPointRoute";
import {
    rememberReturnCheckpoint,
    clearReturnCheckpoint,
} from "../../../lib/returnCheckpoint/index.js";
import { CHECKPOINT_TYPES } from "../../../lib/returnCheckpoint/constants.js";

const SignInAPI = () => {
    const location = useLocation(),
        navigate = useNavigate(),
        { setAccessToken } = useAuth(),
        //이전의 URL 을 기억합니다
        localeMatch = location.pathname?.match(/^\/([a-zA-Z-]{2,5})(?=\/|$)/),
        prefix = localeMatch ? `/${localeMatch[1]}` : "",
        defaultPath = `${prefix}/analyze/upload`,
        fromLocation = location.state?.from,
        fromPath = fromLocation?.pathname || defaultPath,
        fromSearch = fromLocation?.search || "",
        from = `${fromPath}${fromSearch}`;
    /**
     * 사용자의 로그인 정보를 이용해 서버에 인증 요청 전송
     * 성공 시 반환한 액세스 토큰을 서버내 전역적으로 저장 후 이전 페이지 or 홈으로 이동합니다
     * @async
     * @function
     * @param formState - 사용자가 입력한 로그인 정보
     * @returns {Promise<void>} - 인증 성공 시 반환 없음, 실패 시 에러 throw
     * @throws {error} - 인증 실패 시 서버에서 전달한 에러 메세지와 상태 코드를 포함한 에러를 던집니다
     */
    const signIn = async (formState) => {
        const requestData = {
            user: {
                userId: formState.userId
            },
            password: {
                password: formState.password
            },
        };

        try {
            rememberReturnCheckpoint(CHECKPOINT_TYPES.AUTH, from);
            const response = await axios.post(AUTH_ENDPOINTS.SIGNIN, requestData, {
                withCredentials: true,
                headers: {
                    'X-Request-ID': '12345',
                }
            });
            setAccessToken(response.data.accessToken);
            clearReturnCheckpoint(CHECKPOINT_TYPES.AUTH);
            navigate(from, {replace: true});
        } catch (error) {
            const resp = error?.response;
            const err = new Error(resp?.data?.message || 'Login failed');
            err.status = resp?.status;
            err.code = resp?.data?.code;
            throw err;
        }
    };
    return {signIn};
}
export default SignInAPI;
