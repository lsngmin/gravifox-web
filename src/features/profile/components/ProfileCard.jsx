import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { UserCircleIcon, PencilSquareIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from 'providers/authProvider';
import axios from 'axios';
import { PROFILE_ENDPOINTS } from 'api/endPointRoute';
import { getProfileCache, setProfileCache } from 'utils/profileCache';

export default function ProfileCard({ theme = 'dark' }) {
  const { userInfo, setUserInfo } = useAuth();

  const NICKNAME_MAX_LENGTH = 20;
  const NICKNAME_COOLDOWN_DAYS = 7;
  const NICKNAME_PATTERN = /^[0-9A-Za-z가-힣._-]+$/;

  const [nickname, setNickname] = useState(userInfo?.nickname ?? '');
  const [editing, setEditing] = useState(false);
  const [nicknameError, setNicknameError] = useState('');
  const email = userInfo?.userId ?? '';
  const [savingName, setSavingName] = useState(false);

  const isDark = theme === 'dark';
  const serverNicknameUpdatedAt =
    userInfo?.nicknameUpdatedAt || userInfo?.profileUpdatedAt || userInfo?.updatedAt || userInfo?.profile?.updatedAt || null;

  useEffect(() => {
    if (!editing) {
      setNickname(userInfo?.nickname ?? '');
    }
  }, [userInfo?.nickname, editing]);
  const lastNicknameChange = serverNicknameUpdatedAt || null;
  const nextNicknameChangeAt = lastNicknameChange && dayjs(lastNicknameChange).isValid()
    ? dayjs(lastNicknameChange).add(NICKNAME_COOLDOWN_DAYS, 'day')
    : null;
  const canEditNickname = !nextNicknameChangeAt || dayjs().isAfter(nextNicknameChangeAt);

  useEffect(() => {
    if (!canEditNickname && editing) {
      setEditing(false);
    }
  }, [canEditNickname, editing]);

  async function handleSaveField() {
    const value = (nickname || '').trim();
    if (!value) {
      setNicknameError('닉네임을 입력해주세요.');
      return { ok: false, changed: false };
    }
    if (value.length > NICKNAME_MAX_LENGTH) {
      setNicknameError(`닉네임은 ${NICKNAME_MAX_LENGTH}자 이하로 입력해주세요.`);
      return { ok: false, changed: false };
    }
    if (!NICKNAME_PATTERN.test(value)) {
      setNicknameError('닉네임은 한글, 영문, 숫자, ., _, -만 사용할 수 있어요.');
      return { ok: false, changed: false };
    }
    const currentNickname = (userInfo?.nickname || '').trim();
    if (value === currentNickname) {
      setNickname(currentNickname);
      setNicknameError('');
      return { ok: true, changed: false };
    }

    setSavingName(true);
    setNicknameError('');
    const prev = userInfo;
    try {
      // Optimistic update
      if (prev) setUserInfo({ ...prev, nickname: value });
      const cached = userInfo?.userNo ? getProfileCache(userInfo.userNo) : null;
      const headers = {};
      if (cached?.etag) headers['If-Match'] = cached.etag;
      const resp = await axios.patch(PROFILE_ENDPOINTS.UPDATE, { nickname: value }, { headers });
      const etag = resp?.headers?.etag || resp?.headers?.ETag;
      if (userInfo?.userNo && resp?.data) {
        setProfileCache(userInfo.userNo, resp.data, etag);
        setUserInfo({ ...prev, ...resp.data });
      }
      setNickname(value);
      return { ok: true, changed: true };
    } catch (e) {
      if (prev) setUserInfo(prev);
      setNickname(currentNickname);
      setNicknameError(e?.response?.data?.message || '닉네임을 변경할 수 없어요. 잠시 후 다시 시도해주세요.');
      return { ok: false, changed: false };
    } finally {
      setSavingName(false);
    }
  }

  async function handleConfirmNickname() {
    const result = await handleSaveField();
    if (!result.ok) return;
    setNicknameError('');
    setEditing(false);
  }

  const containerClass = isDark
    ? 'relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-slate-100 shadow-[0_24px_36px_-28px_rgba(15,23,42,0.85)] backdrop-blur'
    : 'rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-sm';

  return (
    <section className={containerClass}>
      {isDark && (
        <>
          <div className="pointer-events-none absolute -top-24 -right-12 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-sky-500/16 blur-[140px]" />
        </>
      )}

      {/* 헤더 */}
      <div className="relative flex items-center gap-2">
        <UserCircleIcon className={`h-6 w-6 ${isDark ? 'text-indigo-300' : 'text-indigo-500'}`} />
        <h2 className="text-base font-semibold">프로필</h2>
      </div>
      <p className={`relative mt-1 text-sm ${isDark ? 'text-slate-300/80' : 'text-gray-500'}`}>
        계정 정보와 공개 이름을 최신 상태로 유지하세요.
      </p>
      <div className={`relative mt-3 h-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />

      {/* 본문 */}
      <div className="relative mt-4 flex flex-col items-stretch justify-between gap-5 md:flex-row">
        <div className="flex-1">
          <div className="space-y-3.5">
            <div
              className={
                isDark
                  ? 'rounded-xl border border-white/12 bg-white/[0.05] p-3 shadow-[0_14px_26px_-24px_rgba(99,102,241,0.45)]'
                  : 'rounded-xl border border-gray-200 bg-gray-50 p-3'
              }
            >
              <label
                className={`block text-[11px] font-medium tracking-wide uppercase ${
                  isDark ? 'text-slate-300/80' : 'text-gray-500'
                }`}
              >
                닉네임
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2.5">
                {editing ? (
                  <>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => {
                        setNickname(e.target.value);
                        if (nicknameError) setNicknameError('');
                      }}
                      maxLength={NICKNAME_MAX_LENGTH}
                      disabled={savingName}
                      className={`w-full rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline-none ${
                        isDark
                          ? 'border-white/20 bg-white/8 text-white placeholder-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-300/60'
                          : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
                      }`}
                      placeholder="표시할 이름을 입력하세요"
                      aria-invalid={nicknameError ? 'true' : 'false'}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleConfirmNickname}
                        disabled={savingName}
                        className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[13px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200/70 disabled:opacity-60 ${
                          isDark
                            ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-500 text-white shadow-[0_12px_20px_-16px_rgba(79,70,229,0.9)] hover:from-indigo-500 hover:via-indigo-500 hover:to-indigo-600'
                            : 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
                        }`}
                      >
                        {savingName ? '저장 중...' : (
                          <>
                            <CheckIcon className="h-4 w-4" />
                            저장
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNickname(userInfo?.nickname ?? '');
                          setNicknameError('');
                          setEditing(false);
                        }}
                        className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[13px] font-semibold transition focus:outline-none ${
                          isDark ? 'text-slate-300 hover:text-white/90' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <XMarkIcon className="h-4 w-4" />
                        취소
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={isDark ? 'text-slate-400/70' : 'text-gray-500'}>
                        한글 포함 {NICKNAME_MAX_LENGTH}자 이내로 입력할 수 있어요.
                      </span>
                      <span className={isDark ? 'text-slate-300/70' : 'text-gray-500'}>
                        {nickname.length}/{NICKNAME_MAX_LENGTH}
                      </span>
                    </div>
                    {nicknameError && (
                      <p className={`mt-2 text-xs ${isDark ? 'text-rose-300' : 'text-rose-600'}`}>{nicknameError}</p>
                    )}
                  </>
                ) : (
                  <>
                    <div
                      className={`w-full rounded-lg border px-3 py-2 text-sm font-medium ${
                        isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-200 bg-white text-gray-900'
                      }`}
                    >
                      {userInfo?.nickname || '닉네임이 설정되지 않았어요'}
                    </div>
                    {canEditNickname && (
                      <button
                        type="button"
                        onClick={() => {
                          setNickname(userInfo?.nickname ?? '');
                          setNicknameError('');
                          setEditing(true);
                        }}
                        className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] font-semibold transition focus:outline-none whitespace-nowrap shrink-0 ${
                          isDark ? 'text-indigo-200 hover:text-white' : 'text-indigo-600 hover:text-indigo-700'
                        }`}
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        수정
                      </button>
                    )}
                  </>
                )}
              </div>
              {!canEditNickname && nextNicknameChangeAt && (
                <p className={`mt-2 text-xs ${isDark ? 'text-slate-300/70' : 'text-gray-500'}`}>
                  닉네임은 {nextNicknameChangeAt.format('YYYY.MM.DD HH:mm')} 이후에 다시 변경할 수 있어요.
                  <br className="hidden sm:block" />
                  (최대 {NICKNAME_COOLDOWN_DAYS}일 간격)
                </p>
              )}
            </div>

            <div
              className={
                isDark
                  ? 'rounded-xl border border-white/12 bg-white/[0.05] p-3'
                  : 'rounded-xl border border-gray-200 bg-gray-50 p-3'
              }
            >
              <label
                className={`block text-[11px] font-medium tracking-wide uppercase ${
                  isDark ? 'text-slate-300/80' : 'text-gray-500'
                }`}
              >
                로그인 이메일
              </label>
              <input
                type="email"
                value={email || ''}
                readOnly
                aria-readonly="true"
                className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm font-medium focus:outline-none ${
                  isDark
                    ? 'border-white/12 bg-white/[0.06] text-white/90 placeholder-transparent focus:border-indigo-300/70 focus:ring-2 focus:ring-indigo-300/40'
                    : 'border-gray-200 bg-white text-gray-900 placeholder-transparent focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200/60'
                }`}
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
