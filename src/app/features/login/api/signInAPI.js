import { useAuth } from "providers/authProvider";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { AUTH_ENDPOINTS } from "../../../../api/endPointRoute";
import {
    rememberReturnCheckpoint,
    clearReturnCheckpoint,
} from "../../../../lib/returnCheckpoint/index.js";
import { CHECKPOINT_TYPES } from "../../../../lib/returnCheckpoint/constants.js";

const SignInAPI = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { setAccessToken } = useAuth();

    const localeMatch = location.pathname?.match(/^\/([a-zA-Z-]{2,5})(?=\/|$)/);
    const localePrefix = localeMatch ? `/${localeMatch[1]}` : "";
    // Default to localized site root when no previous path exists
    const defaultPath = localePrefix || "/";
    const fromLocation = location.state?.from;
    const fromPath = fromLocation?.pathname || defaultPath;
    const fromSearch = fromLocation?.search || "";
    const from = `${fromPath}${fromSearch}`;

    const signIn = async (formState) => {
        const requestData = {
            user: {
                userId: formState.userId,
            },
            password: {
                password: formState.password,
            },
        };

        try {
            rememberReturnCheckpoint(CHECKPOINT_TYPES.AUTH, from);
            const response = await axios.post(AUTH_ENDPOINTS.SIGNIN, requestData, {
                withCredentials: true,
                headers: {
                    "X-Request-ID": "12345",
                },
            });
            setAccessToken(response.data.accessToken);
            clearReturnCheckpoint(CHECKPOINT_TYPES.AUTH);
            navigate(from, { replace: true });
        } catch (error) {
            const resp = error?.response;
            const err = new Error(resp?.data?.message || "Login failed");
            err.status = resp?.status;
            err.code = resp?.data?.code;
            throw err;
        }
    };

    return { signIn };
};

export default SignInAPI;
