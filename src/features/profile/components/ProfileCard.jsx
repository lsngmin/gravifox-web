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
    <section className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm rounded-2xl p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <UserCircleIcon className="w-6 h-6 text-indigo-500" />
        <h2 className="text-base font-semibold text-gray-900">Profile</h2>
      </div>
      <p className="mt-1 text-sm text-gray-500">Manage your profile details and account settings.</p>
      <div className="mt-3 h-px bg-gray-200" />

      {/* 본문 */}
      <div className="mt-6 flex flex-col md:flex-row justify-between items-stretch gap-6">
        {/* 좌측: 이름/이메일 */}
        <div className="flex-1">
          <div className="space-y-4">
            {/* 이름 */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Name</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-900"
                />
                <button
                  type="button"
                  onClick={handleSaveField}
                  disabled={savingName}
                  className="shrink-0 px-3 py-1.5 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingName ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            {/* 이메일 */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Email</label>
              <div className="flex items-center gap-3">
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="hidden md:block self-stretch w-px bg-gray-200" />

        {/* 우측: 아바타 */}
        <div className="md:w-56 flex items-center justify-center min-h-[8rem]">
          <div className="group">
            <div
              className="relative w-32 h-32 rounded-full bg-indigo-500 text-white flex items-center justify-center text-4xl font-bold overflow-hidden shadow-sm cursor-pointer"
              onClick={onAvatarClick}
              title="Click to change photo"
            >
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                (nickname?.[0] ?? 'U').toUpperCase()
              )}
              <div className="pointer-events-none absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <div className="flex items-center gap-2 text-white text-sm font-medium">
                  <CameraIcon className="w-4 h-4" />
                  {savingAvatar ? 'Uploading...' : 'Change'}
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
            <p className="mt-2 text-xs text-gray-500 text-center md:text-right">JPG/PNG, up to 5MB</p>
          </div>
        </div>
      </div>
    </section>
  );
}

