import { FASTAPI_ENDPOINTS } from "../../../api/endPointRoute";
import ensureUploadToken from "./uploadTokenClient";

/**
 * FastAPI 업로드 클라이언트
 * - POST {FASTAPI_BASE}/upload
 * - 멀티파트 키: `file`
 * - 응답: { uploadId: string }
 */
export function useFastUploadAPI() {
  const uploadFile = async (file) => {
    if (!file) throw new Error("파일이 없습니다.");
    const url = FASTAPI_ENDPOINTS.UPLOAD;
    if (!url) {
      throw new Error("업로드 엔드포인트가 설정되지 않았어요. 환경 변수를 확인해 주세요.");
    }
    const { uploadId, uploadToken } = await ensureUploadToken(file);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadId", uploadId);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Upload-Token": uploadToken },
      body: formData,
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const detail = body?.detail || response.statusText || "업로드에 실패했어요.";
      throw new Error(detail);
    }
    const payload = await response.json().catch(() => ({}));
    return { uploadId: payload?.uploadId || uploadId, payload };
  };

  return { uploadFile };
}

export default useFastUploadAPI;
