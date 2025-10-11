// ===============================================================
// returnCheckpoint/storage.js
// ---------------------------------------------------------------
// 이 파일은 "리턴 체크포인트" 데이터를 실제로 저장하고 불러오는
// **저장소(Storage) 관리 레이어**입니다.
//
// 즉, 세션스토리지(sessionStorage)와 쿠키(cookie)를 다루는 모든 코드를
// 한 곳에서 통합 관리합니다.
//
//  설계 개요
// ---------------------------------------------------------------
// - sessionStorage: 같은 탭/세션 안에서만 유효 (정확한 복원용)
// - cookie: 리다이렉트나 서브도메인 이동 중에도 남도록 힌트 저장용
// - 둘 다 try/catch 안전 처리 → Storage 접근 실패 시 사용자 영향 최소화
// ===============================================================

import { getCookieDomain } from './domain.js';
import {
    SESSION_PREFIX,
    COOKIE_NAME,
    COOKIE_TTL_SEC,
    COOKIE_SAME_SITE,
    SECURE_COOKIE,
} from './constants.js';

/**
 * sessionKey
 * ---------------------------------------------------------------
 * sessionStorage에 저장할 키를 생성합니다.
 * 구조: "return:<type>:<key>"
 * 예: "return:auth:path", "return:upload:state"
 *
 * @param {string} type 체크포인트 종류(auth, upload 등)
 * @param {string} key  "path" 또는 "state"
 * @returns {string} 완성된 세션 키
 */
const sessionKey = (type, key) => `${SESSION_PREFIX}:${type}:${key}`;

/**
 * saveToSession
 * ---------------------------------------------------------------
 * 세션스토리지에 리턴 경로(path)와 상태(state)를 저장합니다.
 *
 * - path: 돌아올 페이지 경로
 * - state: JSON 형태로 직렬화된 부가 데이터
 *
 * 주의:
 *  - Safari Private Mode에서는 sessionStorage 접근이 차단될 수 있으므로,
 *    try/catch 로 감싸는 쪽에서 안전하게 호출해야 합니다.
 *
 * @param {string} type  체크포인트 종류
 * @param {string} path  리턴 경로
 * @param {any}    state 부가 상태 정보
 */
export const saveToSession = (type, path, state) => {
    sessionStorage.setItem(sessionKey(type, 'path'), path);

    if (state != null) {
        // 객체 형태의 state를 JSON 문자열로 변환
        sessionStorage.setItem(sessionKey(type, 'state'), JSON.stringify(state));
    } else {
        // state가 없으면 기존 값을 제거
        sessionStorage.removeItem(sessionKey(type, 'state'));
    }
};

/**
 * loadFromSession
 * ---------------------------------------------------------------
 * 세션스토리지에서 path/state를 읽어옵니다.
 *
 * 반환 구조:
 *   { path: string|null, state: any }
 *
 * 예:
 *   const { path, state } = loadFromSession('auth');
 *   console.log(path, state);
 *
 * 예외 상황:
 *  - JSON.parse 실패 시 state를 null로 반환
 *  - Storage 접근 불가 시 전체를 { path: null, state: null }로 반환
 */
export const loadFromSession = (type) => {
    try {
        const path = sessionStorage.getItem(sessionKey(type, 'path'));
        const rawState = sessionStorage.getItem(sessionKey(type, 'state'));

        return {
            path,
            state: rawState ? JSON.parse(rawState) : null,
        };
    } catch {
        // Storage 접근 불가(시크릿모드 등)
        return { path: null, state: null };
    }
};

/**
 * clearSession
 * ---------------------------------------------------------------
 * 세션스토리지에 저장된 리턴 경로와 상태를 삭제합니다.
 *
 * 주로 로그인 후 또는 복원 완료 후 호출됩니다.
 *
 * @param {string} type 체크포인트 종류
 */
export const clearSession = (type) => {
    sessionStorage.removeItem(sessionKey(type, 'path'));
    sessionStorage.removeItem(sessionKey(type, 'state'));
};


/**
 * cookieName
 * ---------------------------------------------------------------
 * 쿠키 이름 생성기.
 * type별로 쿠키 이름이 달라야 충돌이 없으므로, 기본 prefix 뒤에 type을 붙입니다.
 * 예: returnCheckpoint_auth, returnCheckpoint_upload
 */
const cookieName = (type) => `${COOKIE_NAME}_${type}`;

/**
 *  saveToCookie
 * ---------------------------------------------------------------
 * 쿠키에 리턴 경로(path)를 저장합니다.
 * (state는 크기 제한/보안 문제로 세션에만 저장)
 *
 * 쿠키는 "얇은 힌트" 용도로만 사용되며,
 * 서브도메인 이동/리다이렉트 중에도 경로를 유지시킬 수 있습니다.
 *
 * 설정 정책:
 *  - path=/ : 모든 경로에서 유효
 *  - max-age=COOKIE_TTL_SEC : TTL(기본 10분)
 *  - domain=.{example}.com : getCookieDomain() 결과
 *  - SameSite=Lax : CSRF 방지
 *  - Secure : HTTPS일 때만 전송
 *
 * @param {string} type 체크포인트 종류
 * @param {string} path 리턴 경로
 */
export const saveToCookie = (type, path) => {
    const encoded = encodeURIComponent(path); // URL-safe encoding
    const domain = getCookieDomain();
    const domainFlag = domain ? `; domain=${domain}` : '';
    const secureFlag = SECURE_COOKIE ? '; Secure' : '';

    // 쿠키 문자열 조합
    document.cookie = `${cookieName(type)}=${encoded}; path=/; max-age=${COOKIE_TTL_SEC}; SameSite=${COOKIE_SAME_SITE}${domainFlag}${secureFlag}`;
};


/**
 *  clearCookie
 * ---------------------------------------------------------------
 * 쿠키에 저장된 리턴 경로를 제거합니다.
 * (max-age=0 으로 덮어써서 즉시 만료)
 *
 * 삭제 시 주의:
 *  - 쿠키는 저장할 때와 동일한 domain/SameSite/secure 설정을 사용해야
 *    브라우저에서 정상적으로 삭제됩니다.
 *
 * @param {string} type 체크포인트 종류
 */
export const clearCookie = (type) => {
    const domain = getCookieDomain();
    const domainFlag = domain ? `; domain=${domain}` : '';
    const secureFlag = SECURE_COOKIE ? '; Secure' : '';

    document.cookie = `${cookieName(type)}=; path=/; max-age=0; SameSite=${COOKIE_SAME_SITE}${domainFlag}${secureFlag}`;
};

// ===============================================================
//  설계 요약
// ---------------------------------------------------------------
// 1. sessionStorage
//    - 정확한 데이터 복원용 (path + state)
//    - 탭/세션 범위에만 유효 → 보안/격리성 높음
//
// 2. cookie
//    - 리다이렉트나 서브도메인 이동 시 힌트용 (path만)
//    - TTL 짧게(기본 10분) + SameSite=Lax + Secure 플래그 적용
//
// 3. key 네임스페이스 구조
//    - 세션 키: "return:<type>:path/state"
//    - 쿠키 키: "<COOKIE_NAME>_<type>"
//
// 4. 에러 안전 설계
//    - 모든 Storage 연산은 예외가 발생해도 크래시 없이 무시(silent fail)
//
// 5. 삭제 정책
//    - 복원이 끝난 즉시 clearSession() + clearCookie() 호출로 잔여 데이터 제거
// ===============================================================
