// ===============================================================
// returnCheckpoint/domain.js
// ---------------------------------------------------------------
// 쿠키의 domain(도메인 범위)을 계산하는 유틸리티입니다.
//
// window.location.hostname 을 기준으로 자동 계산합니다.
//    예: app.dev.example.com → .example.com
//
// 목적:
//  - SameSite=Lax + Secure 정책과 함께
//    다중 서브도메인 환경에서도 쿠키를 공유할 수 있도록 하기 위함입니다.
// ===============================================================

import { COOKIE_DOMAIN } from './constants.js';

/**
 * 현재 환경에 맞는 쿠키 도메인을 반환합니다.
 * - 환경변수에서 강제 지정된 도메인이 있으면 그대로 사용
 * - 없으면 현재 호스트명으로부터 최상위 2단계 도메인을 계산
 * - localhost, 127.0.0.1 은 쿠키 domain 속성을 설정하지 않음
 *
 * 예시:
 *   getCookieDomain() // .gravifox.com
 *
 * @returns {string} domain 값 ('.example.com' or '')
 */
export const getCookieDomain = () => {
    // SSR 환경(서버 렌더링)에서는 window 객체가 없으므로 빈 문자열 반환
    if (typeof window === 'undefined') return '';

    // 도메인이 지정되어 있으면 그대로 사용
    if (COOKIE_DOMAIN && COOKIE_DOMAIN.trim()) {
        return COOKIE_DOMAIN.trim();
    }

    // 그렇지 않다면 현재 호스트 기반으로 계산
    const host = window.location?.hostname;

    // localhost나 IP 주소는 domain 속성 설정 불가 → 빈 문자열 반환
    if (!host || host === 'localhost' || host === '127.0.0.1') return '';

    // 호스트를 '.' 기준으로 나눈 뒤 마지막 두 단계만 취함
    // 예: app.dev.example.com → ['app', 'dev', 'example', 'com']
    const parts = host.split('.');

    // 도메인 구조가 짧으면 그대로 사용
    if (parts.length <= 2) return `.${host}`;

    // 하위 서브도메인을 제거하고 최상위 도메인 반환
    return `.${parts.slice(-2).join('.')}`;
};
