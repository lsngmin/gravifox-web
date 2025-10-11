import axios from "../../../api/http";
import { ANALYZE_ENDPOINTS } from "../../../api/endPointRoute";

export async function fetchQuotaSummary() {
  try {
    const response = await axios.get(ANALYZE_ENDPOINTS.QUOTA_SUMMARY);
    return response?.data || null;
  } catch (error) {
    const resp = error?.response;
    const err = new Error(resp?.data?.message || resp?.data?.error || error?.message || "요약 정보를 불러오지 못했어요.");
    err.status = resp?.status;
    err.code = resp?.data?.error || resp?.data?.code;
    throw err;
  }
}
