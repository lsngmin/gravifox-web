// ===============================================================
// returnCheckpoint/pathUtils.js
// ---------------------------------------------------------------
// 이 파일은 리턴 경로(path)를 "정제(sanitize)"하는 역할을 합니다.
//
// 로그인/업로드/결제 완료 후 돌아갈 경로를 클라이언트에서 전달받을 때,
// 외부 사이트로 리다이렉트하는 공격(Open Redirect)을 막기 위한 보안 레이어입니다.
//
// sanitizePath()는 다음 원칙으로 경로를 검증합니다:
//  1. 절대 URL(http:// 또는 https://)이면 현재 사이트(origin)과 동일할 때만 허용
//  2. 상대 경로일 경우 항상 '/'로 시작하도록 강제 보정
//  3. 잘못된 입력은 null 반환 → 이후 기본 경로(DEFAULT_RETURN_PATH)로 fallback
// ===============================================================

/**
 * sanitizePath(path)
 * ---------------------------------------------------------------
 * 외부 도메인 리다이렉트를 방지하기 위한 경로 정제기.
 *
 * 처리 규칙:
 *   - 절대 URL(https://...) → 현재 window.location.origin 과 같을 때만 허용
 *   - 상대경로(xyz 또는 dashboard) → 앞에 '/'를 자동으로 붙임 → '/xyz'
 *   - 그 외 잘못된 값(null, 숫자, 빈 문자열 등)은 null 반환
 *
 * 예시:
 *   sanitizePath('https://app.gravifox.com/dashboard')
 *     → '/dashboard'
 *
 *   sanitizePath('https://evil.com/phishing')
 *     → null  (외부 origin)
 *
 *   sanitizePath('dashboard')
 *     → '/dashboard'
 *
 *   sanitizePath('/settings')
 *     → '/settings'
 *
 * @param {string} path 리턴하려는 경로(절대 또는 상대)
 * @returns {string|null} 정제된 안전한 경로 or null
 */
export const sanitizePath = (path) => {
    // 1. path가 문자열이 아니거나 비어 있으면 무시
    if (typeof path !== 'string' || !path) return null;

    // 2. 절대 URL 형태라면
    if (path.startsWith('http://') || path.startsWith('https://')) {
        try {
            const url = new URL(path);

            // (보안 핵심) 현재 origin과 다르면 차단
            if (url.origin !== window.location.origin) return null;

            // 오리진 제거 → pathname + query + hash 만 사용
            return `${url.pathname}${url.search}${url.hash}`;
        } catch {
            // URL 파싱 실패 시도 → 의심스러운 입력으로 간주하고 차단
            return null;
        }
    }

    // 3. 상대경로면 선행 슬래시를 붙여 안전한 절대경로로 보정
    if (!path.startsWith('/')) return `/${path}`;

    // 4. 이미 안전한 형태면 그대로 반환
    return path;
};

// ===============================================================
// 설계 요약
// ---------------------------------------------------------------
// 1. 외부 도메인으로 redirect되는 공격(open redirect)을 예방
// 2. URL 인코딩 오류, 파싱 실패 등은 모두 null 처리하여 안전한 fallback 유도
// 3. 경로만 반환(path + search + hash), 오리진은 절대 포함하지 않음
// 4. sanitize 실패 시 DEFAULT_RETURN_PATH('/') 로 대체
// ===============================================================