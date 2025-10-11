import axios from "../../../api/http";
import { API_BASE } from "../../../api/endPointRoute";

const BYPASS_TOKEN = (process.env.REACT_APP_UPLOAD_TOKEN_BYPASS || "").trim();
const BYPASS_UPLOAD_ID_PREFIX = (process.env.REACT_APP_UPLOAD_TOKEN_BYPASS_UPLOAD_ID_PREFIX || "").trim();

export const buildUploadId = (file) => {
  const uuid = typeof crypto !== "undefined" && crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  const name = (file?.name || "").toLowerCase();
  const dot = name.lastIndexOf(".");
  if (dot !== -1 && dot < name.length - 1) {
    const ext = name.slice(dot);
    return `${uuid}${ext}`;
  }
  return uuid;
};

export const requestUploadToken = async (uploadId) => {
  const baseUrl = API_BASE || "https://api.gravifox.com";
  const resp = await axios.post(`${baseUrl}/api/v1/files/upload-token`, { uploadId });
  return resp?.data || null;
};

export const ensureUploadToken = async (file) => {
  if (BYPASS_TOKEN) {
    const baseId = buildUploadId(file);
    const uploadId = BYPASS_UPLOAD_ID_PREFIX ? `${BYPASS_UPLOAD_ID_PREFIX}-${baseId}` : baseId;
    return {
      uploadId,
      uploadToken: BYPASS_TOKEN,
      payload: {
        uploadId,
        source: "bypass",
      },
    };
  }

  const uploadId = buildUploadId(file);
  const payload = await requestUploadToken(uploadId);
  const token = payload?.uploadToken || payload?.token;
  if (!token) {
    throw new Error("업로드 토큰을 발급받지 못했어요.");
  }
  return { uploadId, uploadToken: token, payload };
};

export default ensureUploadToken;
