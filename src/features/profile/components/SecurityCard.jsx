import React, { useEffect, useState, useMemo } from 'react';
import { ShieldCheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { PROFILE_ENDPOINTS, AUTH_ENDPOINTS } from 'api/endPointRoute';
import { useAuth } from 'providers/authProvider';

export default function SecurityCard() {
  const { userInfo } = useAuth();
  const isEmailLogin = useMemo(() => (userInfo?.loginType || '').toUpperCase() === 'EMAIL', [userInfo]);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);
  const [pwScore, setPwScore] = useState(0);

  function scorePassword(s) {
    let score = 0;
    if (!s) return 0;
    if (s.length >= 8) score += 1;
    if (/[A-Z]/.test(s)) score += 1;
    if (/[a-z]/.test(s)) score += 1;
    if (/\d/.test(s)) score += 1;
    if (/[^A-Za-z0-9]/.test(s)) score += 1;
    return score; // 0~5
  }

  useEffect(() => { setPwScore(scorePassword(pw.next)); }, [pw.next]);

  async function handleChangePassword() {
    if (pw.next !== pw.confirm) return alert('새 비밀번호가 일치하지 않습니다.');
    if (pwScore < 3) return alert('비밀번호가 너무 약합니다.');
    setSavingPw(true);
    try {
      await axios.patch(PROFILE_ENDPOINTS.POST_PASSWORD, {
        currentPassword: pw.current,
        newPassword: pw.next,
      });
      alert('비밀번호가 변경되었습니다. 메인으로 이동합니다.');
      // 로그아웃 처리 후 메인으로 이동 (쿠키 정리 포함)
      try {
        await axios.post(AUTH_ENDPOINTS.SIGNOUT, {}, { withCredentials: true });
      } catch {}
      window.location.replace('/');
    } catch (e) {
      alert(e?.response?.data?.message || '변경에 실패했습니다.');
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <section className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <ShieldCheckIcon className="w-6 h-6 text-indigo-500" />
        <h2 className="text-base font-semibold text-gray-900">Security</h2>
      </div>
      <p className="mt-1 text-sm text-gray-500">Manage your password and security settings.</p>
      <div className="mt-3 h-px bg-gray-200" />

      {!isEmailLogin ? (
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">
            이 계정은 소셜 로그인으로 사용 중이에요. 비밀번호는 설정되어 있지 않으며, 비밀번호 변경이 필요하지 않습니다.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            보안을 강화하려면 소셜 제공자(예: Google) 계정의 보안 설정을 확인해 주세요.
          </p>
        </div>
      ) : (
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-semibold text-gray-900">Change Password</h3>
        </div>
        <p className="text-xs text-gray-500">최소 8자, 대/소문자·숫자·특수문자 중 3가지 이상을 포함하면 좋아요.</p>

        <div className="mt-4 grid grid-cols-1 gap-4">
          {/* Current */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Current</label>
            <div className="flex items-center gap-2">
              <input
                type={showPw.current ? 'text' : 'password'}
                value={pw.current}
                onChange={(e) => setPw({ ...pw, current: e.target.value })}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-900"
                placeholder="현재 비밀번호"
              />
              <button
                type="button"
                onClick={() => setShowPw({ ...showPw, current: !showPw.current })}
                className="shrink-0 text-gray-500 hover:text-gray-700"
                aria-label="현재 비밀번호 보기 전환"
              >
                {showPw.current ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* New */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">New</label>
            <div className="flex items-center gap-2">
              <input
                type={showPw.next ? 'text' : 'password'}
                value={pw.next}
                onChange={(e) => setPw({ ...pw, next: e.target.value })}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-900"
                placeholder="새 비밀번호"
              />
              <button
                type="button"
                onClick={() => setShowPw({ ...showPw, next: !showPw.next })}
                className="shrink-0 text-gray-500 hover:text-gray-700"
                aria-label="새 비밀번호 보기 전환"
              >
                {showPw.next ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>

            {/* Strength meter */}
            <div className="mt-2">
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${(pwScore / 5) * 100}%`,
                    backgroundColor: pwScore >= 4 ? '#10b981' : pwScore >= 3 ? '#6366f1' : '#f59e0b',
                  }}
                />
              </div>
              <p className="mt-2 text-[11px] text-gray-500">강도: {pwScore >= 4 ? '강함' : pwScore >= 3 ? '보통' : '약함'}</p>
            </div>
          </div>

          {/* Confirm */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Confirm</label>
            <div className="flex items-center gap-2">
              <input
                type={showPw.confirm ? 'text' : 'password'}
                value={pw.confirm}
                onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-900"
                placeholder="새 비밀번호 확인"
              />
              <button
                type="button"
                onClick={() => setShowPw({ ...showPw, confirm: !showPw.confirm })}
                className="shrink-0 text-gray-500 hover:text-gray-700"
                aria-label="확인 비밀번호 보기 전환"
              >
                {showPw.confirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={savingPw}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {savingPw ? 'Saving...' : 'Update Password'}
          </button>
        </div>
      </div>
      )}
    </section>
  );
}
