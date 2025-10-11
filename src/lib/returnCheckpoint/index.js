// ===============================================================
// returnCheckpoint 모듈
// ---------------------------------------------------------------
// 사용자가 어떤 작업(로그인, 업로드, 결제, 폼 작성 등)을 마치고
// "다시 돌아올 지점"을 안전하게 저장했다가,
// 나중에 복원(get)하거나 정리(clear)할 수 있도록 돕는 모듈.
//
// 즉, remember → get → clear 3단계로 사용하는
// 작은 상태 복원 시스템입니다.
//
// 예시:
//   rememberReturnCheckpoint('auth', window.location.href);
//   const { path } = getReturnCheckpoint('auth');
//   if (path) navigate(path);
//   clearReturnCheckpoint('auth');
// ===============================================================

import { sanitizePath } from './pathUtils.js';
import {
    saveToSession, loadFromSession, clearSession,
    saveToCookie, clearCookie,
} from './storage.js';
import { DEFAULT_RETURN_PATH, CHECKPOINT_TYPES } from './constants.js';

/**
 * rememberReturnCheckpoint
 * ---------------------------------------------------------------
 * 지정된 type(auth, upload, form 등)에 대한
 * "돌아올 지점"을 세션스토리지와 쿠키에 저장합니다.
 *
 * 내부 동작:
 *  1. sanitizePath() 로 외부 도메인 리다이렉트를 차단
 *  2. sessionStorage 에 path/state 저장
 *  3. 쿠키에 경로만 간단히 저장 (서브도메인 이동 대비)
 *
 * 주의:
 *  - state에는 토큰, 개인정보 등 민감한 값 넣지 말 것
 *  - Safari Private Mode 등에서 sessionStorage가 막혀도
 *    try/catch 로 조용히 실패(silent fail)하도록 설계됨
 *
 * 예시:
 *  rememberReturnCheckpoint('auth', window.location.href, { from: 'login' });
 *
 * @param {string} type  체크포인트 종류 (auth, upload, form 등)
 * @param {string} path  돌아올 경로
 * @param {any}    state 부가 상태 정보 (선택)
 */
export const rememberReturnCheckpoint = (
    type = CHECKPOINT_TYPES.AUTH,
    path,
    state = null
) => {
    try {
        // 1. 경로 정제 (외부 도메인 차단, 상대경로 보정)
        const sanitized = sanitizePath(path) || DEFAULT_RETURN_PATH;

        // 2. 세션에 저장 (정확한 복원 데이터)
        saveToSession(type, sanitized, state);

        // 3. 쿠키에 저장 (리다이렉트 중 힌트용)
        saveToCookie(type, sanitized);
    } catch {
        // 일부 브라우저에서 storage 접근이 막히는 경우 (ex. 사파리 시크릿모드)
        // 사용자 경험에 영향을 주지 않기 위해 조용히 무시
    }
};

/**
 * getReturnCheckpoint
 * ---------------------------------------------------------------
 * 지정된 type의 리턴 체크포인트를 불러옵니다.
 * (기본값은 auth)
 *
 * 세션스토리지에서 데이터를 읽어
 * { path, state } 형태로 반환합니다.
 *
 * 쿠키는 "보조 힌트"로만 사용하므로,
 * 기본적으로 세션 값만 읽습니다.
 *
 * 예시:
 *  const { path, state } = getReturnCheckpoint('auth');
 *  if (path) navigate(path);
 *
 * @param {string} type 체크포인트 종류
 * @returns {{ path: string|null, state: any }}
 */
export const getReturnCheckpoint = (
    type = CHECKPOINT_TYPES.AUTH
) => loadFromSession(type);

/**
 * clearReturnCheckpoint
 * ---------------------------------------------------------------
 * 지정된 type의 체크포인트 데이터를 모두 제거합니다.
 * (세션스토리지 + 쿠키)
 *
 * 복원이 끝난 후 반드시 호출해야 합니다.
 * 오래 남아 있으면 예기치 않은 자동 복귀가 일어날 수 있음.
 *
 * 예시:
 *  clearReturnCheckpoint('auth');
 *
 * @param {string} type 체크포인트 종류
 */
export const clearReturnCheckpoint = (
    type = CHECKPOINT_TYPES.AUTH
) => {
    try {
        // 세션 및 쿠키 정리
        clearSession(type);
        clearCookie(type);
    } catch {
        // 삭제 중 에러는 무시 (보안적으로 위험하지 않음)
    }
};

// ===============================================================
// 설계 요약
// ---------------------------------------------------------------
// 1. 세션 + 쿠키 이중 저장
//    - 세션: 같은 탭 내에서 정확한 데이터 복원용
//    - 쿠키: 리다이렉트 중 크로스 서브도메인 복원 보조용
//
// 2. 보안 방어
//    - sanitizePath(): 외부 도메인 리다이렉트 차단
//    - 쿠키: SameSite=Lax, HTTPS에서는 Secure 플래그 추가
//
// 3. TTL 정책
//    - 쿠키는 constants.js 의 COOKIE_POLICY.maxAgeSec (기본 600초, 10분)
//
// 4. 타입 기반 네임스페이스
//    - auth, upload, form, payment 등 서로 다른 흐름이 충돌 없이 공존
//
// 5. 에러 허용 설계
//    - Storage 접근 실패, JSON 파싱 오류 등은 전부 try/catch 내부에서 안전하게 무시
//
// 6. 사용 패턴
//    remember → get → clear
// ===============================================================
