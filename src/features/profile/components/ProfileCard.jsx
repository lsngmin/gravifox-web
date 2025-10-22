import React, { useRef, useState } from 'react';
import { UserCircleIcon, CameraIcon } from '@heroicons/react/24/outline';
import { useAuth } from 'providers/authProvider';
import axios from 'axios';
import { PROFILE_ENDPOINTS } from 'api/endPointRoute';
import { getProfileCache, setProfileCache } from 'utils/profileCache';

export default function ProfileCard() {
  const { userInfo, setUserInfo } = useAuth();

  const [nickname, setNickname] = useState(userInfo?.nickname ?? '');
  const email = userInfo?.userId ?? '';
  const [avatar, setAvatar] = useState(null);
  const [savingName, setSavingName] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  async function handleSaveField() {
    const value = (nickname || '').trim();
    if (!value) return;
    setSavingName(true);
    const prev = userInfo;
    try {
      // Optimistic
      setUserInfo({ ...prev, nickname: value });
      const cached = userInfo?.userNo ? getProfileCache(userInfo.userNo) : null;
      const headers = {};
      if (cached?.etag) headers['If-Match'] = cached.etag;
      const resp = await axios.patch(PROFILE_ENDPOINTS.UPDATE, { nickname: value }, { headers });
      const etag = resp?.headers?.etag || resp?.headers?.ETag;
      if (userInfo?.userNo && resp?.data) {
        setProfileCache(userInfo.userNo, resp.data, etag);
        setUserInfo({ ...prev, ...resp.data });
      }
    } catch (e) {
      // Revert on error
      setUserInfo(prev);
    } finally {
      setSavingName(false);
    }
  }

  function onAvatarClick() {
    fileInputRef.current?.click();
  }

  async function onAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSavingAvatar(true);
    try {
      const preview = URL.createObjectURL(file);
      setAvatar(preview);
      // TODO: replace with actual upload API
      // await axios.post(UPLOAD_ENDPOINT, formData)
    } catch {
    } finally {
      setSavingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-slate-100 shadow-[0_24px_36px_-28px_rgba(15,23,42,0.85)] backdrop-blur">
      <div className="pointer-events-none absolute -top-24 -right-12 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-sky-500/16 blur-[140px]" />

      {/* 헤더 */}
      <div className="relative flex items-center gap-2">
        <UserCircleIcon className="h-6 w-6 text-indigo-300" />
        <h2 className="text-base font-semibold text-white">프로필</h2>
      </div>
      <p className="relative mt-1 text-sm text-slate-300/80">계정 정보와 공개 이름을 최신 상태로 유지하세요.</p>
      <div className="relative mt-3 h-px bg-white/10" />

      {/* 본문 */}
      <div className="relative mt-4 flex flex-col items-stretch justify-between gap-5 md:flex-row">
        {/* 좌측: 이름/이메일 */}
        <div className="flex-1">
          <div className="space-y-3.5">
            {/* 이름 */}
            <div className="rounded-xl border border-white/12 bg-white/[0.05] p-3 shadow-[0_14px_26px_-24px_rgba(99,102,241,0.45)]">
              <label className="block text-[11px] font-medium tracking-wide text-slate-300/80 uppercase">닉네임</label>
              <div className="mt-2 flex items-center gap-2.5">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="flex-1 rounded-lg border border-white/20 bg-white/8 px-3 py-2 text-sm font-medium text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300/60 transition"
                  placeholder="표시할 이름을 입력하세요"
                />
                <button
                  type="button"
                  onClick={handleSaveField}
                  disabled={savingName}
                  className="shrink-0 rounded-md bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-500 px-3 py-1.5 text-[13px] font-semibold text-white shadow-[0_12px_20px_-16px_rgba(79,70,229,0.9)] transition hover:from-indigo-500 hover:via-indigo-500 hover:to-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200/70 disabled:opacity-60"
                >
                  {savingName ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>

            {/* 이메일 */}
            <div className="rounded-xl border border-white/12 bg-white/[0.05] p-3">
              <label className="block text-[11px] font-medium tracking-wide text-slate-300/80 uppercase">로그인 이메일</label>
              <div className="mt-2 flex items-center gap-2.5">
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="flex-1 rounded-lg border border-white/20 bg-white/8 px-3 py-2 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-indigo-200/50"
                />
              </div>
              <p className="mt-1.5 text-[10px] text-slate-400/75">개인정보 보호를 위해 이메일은 읽기 전용으로 표시돼요.</p>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="hidden w-px self-stretch bg-white/10 md:block" />

        {/* 우측: 아바타 */}
        <div className="flex min-h-[8rem] items-center justify-center md:w-48">
          <div className="group relative">
            <div
              className="relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-[2.25rem] font-bold text-white shadow-[0_20px_36px_-24px_rgba(99,102,241,0.9)]"
              onClick={onAvatarClick}
              title="프로필 사진 변경"
            >
              {avatar ? (
                <img src={avatar} alt="프로필 이미지" className="h-full w-full object-cover" />
              ) : (
                (nickname?.[0] ?? 'U').toUpperCase()
              )}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/45 opacity-0 transition group-hover:opacity-100">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <CameraIcon className="h-4 w-4" />
                  {savingAvatar ? '업로드 중...' : '변경'}
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarChange}
            />
            <p className="mt-1.5 text-center text-[11px] text-slate-400/80 md:text-right">JPG/PNG · 최대 5MB</p>
          </div>
        </div>
      </div>
    </section>
  );
}
