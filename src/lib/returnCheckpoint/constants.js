// ===============================================================
// returnCheckpoint/constants.js
// ---------------------------------------------------------------
// 이 파일은 returnCheckpoint 모듈에서 공통으로 사용하는
// "정책 상수(Constant)"를 정의합니다.
//
//  역할
//  - 자주 바뀔 수 있는 환경 설정(쿠키 이름, TTL, SameSite 등)을
//    코드 곳곳에 하드코딩하지 않고, 한 곳에서 중앙 관리합니다.
//  - 환경변수(.env) 값과 함께 동작하여 환경별 설정 차이를 줄입니다.
//
// ===============================================================

/**
 * DEFAULT_RETURN_PATH
 * ---------------------------------------------------------------
 * sanitizePath()가 실패했을 때 사용할 기본 리턴 경로.
 * 즉, "돌아갈 위치를 알 수 없을 때" 어디로 보낼지 정하는 fallback 경로입니다.
 *
 */
export const DEFAULT_RETURN_PATH = '/';

/**
 * CHECKPOINT_TYPES
 * ---------------------------------------------------------------
 * 리턴 체크포인트의 "종류"를 정의한 상수 모음입니다.
 * 여러 기능(로그인, 업로드, 결제 등)이 동시에 이 시스템을 써도
 * 서로 충돌하지 않도록 type으로 구분합니다.
 *
 * 사용 예시:
 *  rememberReturnCheckpoint(CHECKPOINT_TYPES.AUTH, window.location.href);
 *  getReturnCheckpoint(CHECKPOINT_TYPES.UPLOAD);
 */
export const CHECKPOINT_TYPES = {
    AUTH: '0',
    UPLOAD: '1',
    FORM: '2',
    PAYMENT: '3',
};

/**
 * SESSION_PREFIX
 * ---------------------------------------------------------------
 * sessionStorage에 저장할 때 사용하는 key prefix.
 * (예: "rtnckpnt:0:path")
 *
 * 이 접두사를 일관되게 쓰면
 * 브라우저 개발자도구에서 세션스토리지를 볼 때
 * 관련 키들을 한눈에 찾기 쉽습니다.
 */
export const SESSION_PREFIX = 'rtnckpnt';

/**
 * COOKIE_DOMAIN
 * 쿠키가 유효한 도메인.
 * 런타임 시 domain.js에서 window.location.hostname 기준으로 자동 계산합니다.
 * 예: .gravifox.com
 */
export const COOKIE_DOMAIN = process.env.REACT_APP_COOKIE_DOMAIN?.trim()
    || '.gravifox.com';

/**
 * COOKIE_NAME
 * 쿠키의 기본 prefix.
 * type별로 실제 쿠키 이름은 `${COOKIE_NAME}_${type}` 형태가 됩니다.
 *
 * 예: returnCheckpoint_auth
 */
export const COOKIE_NAME = 'rtnckpnt';

/**
 * COOKIE_TTL_SEC
 * 쿠키 유효시간(초 단위).
 * 기본 600초(10분)
 */
export const COOKIE_TTL_SEC = Number(800);

/**
 * COOKIE_SAME_SITE
 * 쿠키 SameSite 정책 (CSRF 방어용)
 * - 기본값: 'Lax'
 * - 필요에 따라 'Strict' 또는 'None'으로 변경 가능
 */
export const COOKIE_SAME_SITE = 'Lax';

/**
 *  SECURE_COOKIE
 * HTTPS 환경에서만 쿠키를 전송하도록 하는 플래그.
 * - window.location.protocol 이 'https:' 일 때 true
 * - 서버 사이드 렌더링(SSR)에서는 기본 false 처리
 */
export const SECURE_COOKIE =
    typeof window !== 'undefined' && window.location?.protocol === 'https:';

/**
 * COOKIE_POLICY
 * ---------------------------------------------------------------
 * 쿠키 관련 정책 상수입니다.
 * - name: 쿠키 이름의 기본 prefix (type별로 뒤에 _auth, _upload 등이 붙음)
 * - maxAgeSec: 쿠키 유효시간 (초 단위, 기본 800초)
 * - sameSite: 기본 SameSite 정책 (CSRF 방지용)
 *
 *  REACT_APP_RETURN_COOKIE_TTL
 */
export const COOKIE_POLICY = {
    // 기본 쿠키 이름. 예: rtnckpnt_auth
    name: COOKIE_NAME,

    // 쿠키 TTL (초 단위). 기본은 800초
    maxAgeSec: COOKIE_TTL_SEC,

    // 쿠키 SameSite 정책 (CSRF 방지용)
    sameSite: COOKIE_SAME_SITE,
};

// ===============================================================
//  설계 요약
// ---------------------------------------------------------------
// 1. 기본 정책은 코드에 정의하고, 운영환경에서 .env로 덮어쓴다.
//    → 개발/스테이징/운영 환경별 쿠키 이름, TTL 등을 유연하게 설정 가능.
//
// 2. CHECKPOINT_TYPES를 명시적으로 관리함으로써
//    - 여러 플로우가 동시에 returnCheckpoint를 사용해도 key 충돌이 없음.
//
// 3. TTL은 보안을 위해 짧게(기본 10분) 설정.
//    - 세션스토리지와 달리 쿠키는 외부로 노출될 가능성이 있으므로
//      장시간 저장은 권장하지 않음.
//
// 4. SameSite=Lax + Secure(HTTPS 시) 플래그로 CSRF 방어 강화.
// ===============================================================
