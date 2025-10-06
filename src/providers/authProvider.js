import {createContext, useContext, useEffect, useState} from "react";

import axios from "axios";
import { setHttpAccessToken, setHttpHandlers } from "../api/http";
import { isTokenValid, getExpiryMs, decodeJwt } from "../utils/jwt";
import { AUTH_ENDPOINTS, PROFILE_ENDPOINTS } from "../api/endPointRoute";
import { getProfileCache, setProfileCache, clearProfileCache } from "../utils/profileCache";

const BOOTSTRAP_TIMEOUT_MS = 15000;

const AuthContext = createContext();

const createTimeoutError = () => {
    const error = new Error('BOOTSTRAP_TIMEOUT');
    error.code = 'BOOTSTRAP_TIMEOUT';
    return error;
};

const withTimeout = (promise, timeoutMs) => new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
        reject(createTimeoutError());
    }, timeoutMs);

    promise
        .then((value) => {
            clearTimeout(timeoutId);
            resolve(value);
        })
        .catch((error) => {
            clearTimeout(timeoutId);
            reject(error);
        });
});

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // 앱 시작 시 로그인 확인이 끝날 때까지 화면을 가리기 위한 게이트
    const [isChecking, setIsChecking] = useState(true);
    const [bootstrapError, setBootstrapError] = useState(null);
    const [bootstrapKey, setBootstrapKey] = useState(0);

    const logout = () => {
        setAccessToken(null);
        if (userInfo?.userNo) {
            try { clearProfileCache(userInfo.userNo); } catch {}
        }
        setUserInfo(null);

        axios.post(AUTH_ENDPOINTS.SIGNOUT, {}, {
            withCredentials: true
        })
        setTimeout(() => {
            window.location.reload();
        }, 1000)
    }

    useEffect(() => {
        // Provide hooks for axios interceptors
        setHttpHandlers({
            onTokenUpdated: (t) => setAccessToken(t),
            onUnauthorized: () => {
                setAccessToken(null);
                setUserInfo(null);
            }
        });
    }, []);

    useEffect(() => {
        // Keep axios layer in sync with current token
        setHttpAccessToken(accessToken);
    }, [accessToken]);

    useEffect(() => {
        const bootstrap = async () => {
            try {
                setBootstrapError(null);
                // 게스트는 초기 체크만 끝내고 진행
                const isGuest = (() => {
                    try { return typeof document !== 'undefined' && document.cookie && document.cookie.includes('guest=1'); } catch { return false; }
                })();
                if (isGuest) {
                    return;
                }

                // 1) AccessToken 확보 (없으면 refresh 시도)
                let at = accessToken;
                if (!at) {
                    const response = await withTimeout(
                        axios.post(AUTH_ENDPOINTS.REFRESH, {}, { withCredentials: true }),
                        BOOTSTRAP_TIMEOUT_MS
                    );
                    const next = response?.data?.accessToken;
                    if (next && isTokenValid(next)) {
                        setAccessToken(next);
                        at = next;
                        // Ensure request interceptor sees the token immediately
                        setHttpAccessToken(next);
                    }
                }

                if (!at || !isTokenValid(at)) {
                    return; // 비로그인 상태로 간주
                }

                // Ensure token is present in interceptors for subsequent calls
                setHttpAccessToken(at);

                // 2) 토큰 해석으로 최소 사용자 식별자 확보
                const payload = decodeJwt(at) || {};
                const userNo = Number(payload.userNo);
                const userId = payload.userId;
                if (!userNo) {
                    return;
                }

                // 3) 캐시 하이드레이트 (즉시 화면에 표시할 수 있게)
                const cached = getProfileCache(userNo);
                if (cached?.data) {
                    setUserInfo({ userNo, userId, ...cached.data });
                } else {
                    setUserInfo({ userNo, userId });
                }

                // 4) 백그라운드 동기화 (ETag로 변경 없으면 304)
                try {
                    const headers = {};
                    if (cached?.etag) headers['If-None-Match'] = cached.etag;
                    const resp = await withTimeout(
                        axios.get(PROFILE_ENDPOINTS.GET_INFO, { headers }),
                        BOOTSTRAP_TIMEOUT_MS
                    );
                    // axios는 304도 성공으로 처리함. status로 분기
                    if (resp?.status === 200 && resp.data) {
                        const etag = resp.headers?.etag || resp.headers?.ETag;
                        setUserInfo({ userNo, userId, ...resp.data });
                        if (etag) setProfileCache(userNo, resp.data, etag);
                    }
                } catch (e) {
                    // 권한 문제 등은 인터셉터에서 처리됨. 여기서는 침묵.
                }
            } catch (error) {
                // 네트워크 오류 등은 초기화만 수행
                if (error?.code === 'BOOTSTRAP_TIMEOUT' || error?.code === 'ECONNABORTED') {
                    setBootstrapError('timeout');
                } else {
                    setBootstrapError('error');
                }
            } finally {
                setIsLoading(false);
                setIsChecking(false);
            }
        };
        bootstrap();
    }, [accessToken, bootstrapKey]);

    // 사전 만료 갱신 타이머: exp - 30초에 refresh 시도
    useEffect(() => {
        if (!accessToken) return;
        const expMs = getExpiryMs(accessToken);
        if (!expMs) return;
        const now = Date.now();
        const lead = 30_000; // 30 seconds
        let delay = expMs - now - lead;
        if (delay < 0) delay = 0;
        const id = setTimeout(async () => {
            try {
                const resp = await axios.post(AUTH_ENDPOINTS.REFRESH, {}, { withCredentials: true });
                const at = resp?.data?.accessToken;
                if (at && isTokenValid(at)) {
                    setAccessToken(at);
                } else {
                    setAccessToken(null);
                    setUserInfo(null);
                }
            } catch {
                setAccessToken(null);
                setUserInfo(null);
            }
        }, delay);
        return () => clearTimeout(id);
    }, [accessToken]);
    const retryBootstrap = () => {
        setIsChecking(true);
        setIsLoading(true);
        setBootstrapError(null);
        setBootstrapKey((key) => key + 1);
    };

    let gateContent = null;
    if (isChecking) {
        gateContent = <div style={{background: '#fff', width: '100vw', height: '100vh'}} />;
    } else if (bootstrapError === 'timeout') {
        gateContent = (
            <div style={{
                background: '#fff',
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                color: '#111'
            }}>
                <p style={{ fontSize: '16px', fontWeight: 500 }}>네트워크 응답이 지연되고 있어요.</p>
                <button
                    type="button"
                    onClick={retryBootstrap}
                    style={{
                        padding: '10px 18px',
                        borderRadius: '8px',
                        border: '1px solid #111',
                        background: '#111',
                        color: '#fff',
                        cursor: 'pointer'
                    }}
                >
                    다시 시도하기
                </button>
            </div>
        );
    } else if (bootstrapError) {
        gateContent = (
            <div style={{
                background: '#fff',
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                color: '#111'
            }}>
                <p style={{ fontSize: '16px', fontWeight: 500 }}>로그인 상태를 확인하는 중 문제가 발생했어요.</p>
                <button
                    type="button"
                    onClick={retryBootstrap}
                    style={{
                        padding: '10px 18px',
                        borderRadius: '8px',
                        border: '1px solid #111',
                        background: '#111',
                        color: '#fff',
                        cursor: 'pointer'
                    }}
                >
                    다시 시도하기
                </button>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ accessToken, setAccessToken, userInfo, setUserInfo, logout, isLoading, isChecking, bootstrapError, retryBootstrap }}>
            {gateContent || children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => useContext(AuthContext);
