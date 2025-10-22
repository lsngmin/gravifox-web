import React, { useEffect, useState, useMemo } from 'react';
import { ShieldCheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { PROFILE_ENDPOINTS, AUTH_ENDPOINTS } from 'api/endPointRoute';
import { useAuth } from 'providers/authProvider';

export default function SecurityCard({ theme = 'dark' }) {
  const { userInfo } = useAuth();
  const isEmailLogin = useMemo(() => (userInfo?.loginType || '').toUpperCase() === 'EMAIL', [userInfo]);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);
  const [pwScore, setPwScore] = useState(0);

  const isDark = theme === 'dark';

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

  useEffect(() => {
    setPwScore(scorePassword(pw.next));
  }, [pw.next]);

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

  const containerClass = isDark
    ? 'relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-slate-100 shadow-[0_28px_44px_-30px_rgba(15,23,42,0.9)] backdrop-blur'
    : 'rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-sm';

  const subCardClass = isDark
    ? 'rounded-xl border border-white/10 bg-white/[0.05] p-3'
    : 'rounded-xl border border-gray-200 bg-gray-50 p-3';

  const labelClass = isDark ? 'block text-[11px] font-medium tracking-wide text-slate-300/80' : 'block text-[11px] font-medium tracking-wide text-gray-500';

  const inputClass = isDark
    ? 'flex-1 border-none bg-transparent text-sm font-medium text-white placeholder-slate-500 focus:ring-0'
    : 'flex-1 border-none bg-transparent text-sm font-medium text-gray-900 placeholder-gray-400 focus:ring-0';

  const dividerClass = isDark ? 'bg-white/5' : 'bg-gray-200';
  const metaTextClass = isDark ? 'text-slate-300/80' : 'text-gray-500';

  return (
    <section className={containerClass}>
      {isDark && (
        <>
          <div className="pointer-events-none absolute -top-24 right-[-80px] h-56 w-56 rounded-full bg-emerald-400/18 blur-[140px]" />
          <div className="pointer-events-none absolute -bottom-28 left-[-60px] h-60 w-60 rounded-full bg-sky-400/16 blur-[150px]" />
        </>
      )}

      <div className="relative flex items-center gap-2">
        <ShieldCheckIcon className={`h-6 w-6 ${isDark ? 'text-emerald-300' : 'text-emerald-500'}`} />
        <h2 className="text-base font-semibold">{isDark ? '보안 설정' : '보안 설정'}</h2>
      </div>
      <p className={`relative mt-1 text-sm ${metaTextClass}`}>비밀번호와 보안 옵션을 최신 상태로 유지하세요.</p>
      <div className={`relative mt-4 h-px ${dividerClass}`} />

      {!isEmailLogin ? (
        <div
          className={
            isDark
              ? 'relative mt-6 rounded-xl border border-white/10 bg-white/[0.05] p-4 text-sm text-slate-200'
              : 'relative mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800'
          }
        >
          <p>이 계정은 소셜 로그인으로 사용 중이에요. 별도의 비밀번호가 저장되어 있지 않습니다.</p>
          <p className={`mt-2 text-xs ${isDark ? 'text-slate-400/80' : 'text-emerald-600'}`}>
            보안을 강화하려면 연결된 소셜 계정(예: Google, Apple)의 보안 설정을 함께 확인해 주세요.
          </p>
        </div>
      ) : (
        <div className="relative mt-6">
          <div className="mb-2 flex items-center gap-2">
            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>비밀번호 변경</h3>
          </div>
          <p className={`text-xs ${metaTextClass}`}>
            최소 8자 이상, 대/소문자·숫자·특수문자 중 3가지 이상을 포함하면 더욱 안전해요.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4">
            <div className={subCardClass}>
              <label className={labelClass}>현재 비밀번호</label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type={showPw.current ? 'text' : 'password'}
                  value={pw.current}
                  onChange={(e) => setPw({ ...pw, current: e.target.value })}
                  className={inputClass}
                  placeholder="현재 비밀번호를 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowPw({ ...showPw, current: !showPw.current })}
                  className={`shrink-0 ${isDark ? 'text-slate-300/80 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  aria-label="현재 비밀번호 보기 전환"
                >
                  {showPw.current ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className={subCardClass}>
              <label className={labelClass}>새 비밀번호</label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type={showPw.next ? 'text' : 'password'}
                  value={pw.next}
                  onChange={(e) => setPw({ ...pw, next: e.target.value })}
                  className={inputClass}
                  placeholder="새 비밀번호를 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowPw({ ...showPw, next: !showPw.next })}
                  className={`shrink-0 ${isDark ? 'text-slate-300/80 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  aria-label="새 비밀번호 보기 전환"
                >
                  {showPw.next ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>

              <div className="mt-3">
                <div className={`h-2 w-full rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${(pwScore / 5) * 100}%`,
                      background:
                        pwScore >= 4
                          ? 'linear-gradient(90deg,#34d399,#10b981)'
                          : pwScore >= 3
                          ? 'linear-gradient(90deg,#6366f1,#8b5cf6)'
                          : 'linear-gradient(90deg,#f59e0b,#f97316)',
                    }}
                  />
                </div>
                <p className={`mt-2 text-[11px] ${metaTextClass}`}>
                  강도:&nbsp;
                  {pwScore >= 4 ? '강함' : pwScore >= 3 ? '보통' : '약함'}
                </p>
              </div>
            </div>

            <div className={subCardClass}>
              <label className={labelClass}>비밀번호 확인</label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type={showPw.confirm ? 'text' : 'password'}
                  value={pw.confirm}
                  onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                  className={inputClass}
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowPw({ ...showPw, confirm: !showPw.confirm })}
                  className={`shrink-0 ${isDark ? 'text-slate-300/80 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  aria-label="확인 비밀번호 보기 전환"
                >
                  {showPw.confirm ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end">
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={savingPw}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200/70 disabled:opacity-60 ${
                isDark
                  ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-500 text-white shadow-[0_18px_32px_-24px_rgba(79,70,229,0.85)] hover:from-indigo-500 hover:via-indigo-500 hover:to-indigo-600'
                  : 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
              }`}
            >
              {savingPw ? '저장 중...' : '비밀번호 업데이트'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
