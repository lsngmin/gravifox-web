import axios from "axios";
import { FASTAPI_ENDPOINTS } from "../../../api/endPointRoute";

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
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: false,
    });
    return res;
  };

  return { uploadFile };
}

export default useFastUploadAPI;

