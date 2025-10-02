import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from 'providers/authProvider';
import { PROFILE_ENDPOINTS } from 'api/endPointRoute';
import { setProfileCache, getProfileCache } from 'utils/profileCache';

export default function ProfileCard() {
  const { userInfo, setUserInfo } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [nickname, setNickname] = useState(userInfo?.nickname || '');

  const initials = useMemo(() => {
    const src = nickname || userInfo?.userId || 'U';
    const s = (src || 'U').trim();
    const letters = s.replace(/[^A-Za-z0-9가-힣]/g, '');
    return (letters[0] || 'U').toUpperCase();
  }, [nickname, userInfo]);

  const email = userInfo?.userId || '';

  const onSave = async () => {
    if (!nickname || nickname.trim().length === 0) {
      setError('Name cannot be blank');
      return;
    }
    setSaving(true);
    setError('');
    const prev = userInfo;
    try {
      // Optimistic update
      setUserInfo({ ...prev, nickname });
      const cached = userInfo?.userNo ? getProfileCache(userInfo.userNo) : null;
      const headers = {};
      // Optionally send If-Match for concurrency using cached.etag
      if (cached?.etag) headers['If-Match'] = cached.etag;
      const resp = await axios.patch(PROFILE_ENDPOINTS.UPDATE, { nickname }, { headers });
      const etag = resp?.headers?.etag || resp?.headers?.ETag;
      if (userInfo?.userNo && resp?.data) {
        setProfileCache(userInfo.userNo, resp.data, etag);
        setUserInfo({ ...prev, ...resp.data });
      }
      setEditing(false);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save');
      // Revert optimistic update on error
      setUserInfo(prev);
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    setNickname(userInfo?.nickname || '');
    setEditing(false);
    setError('');
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
          {initials}
        </div>
        <div className="flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="border rounded-md px-2 py-1 text-sm"
                placeholder="Enter your name"
              />
              <button
                onClick={onSave}
                disabled={saving}
                className="rounded-md bg-indigo-600 text-white text-sm px-3 py-1 disabled:bg-indigo-300"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={onCancel}
                disabled={saving}
                className="rounded-md border text-sm px-3 py-1"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-slate-900">{userInfo?.nickname || 'Unnamed User'}</p>
              {email && <p className="text-xs text-slate-500">{email}</p>}
            </div>
          )}
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="rounded-md border px-3 py-1 text-sm"
          >
            Edit
          </button>
        )}
      </div>
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
    </div>
  );
}

