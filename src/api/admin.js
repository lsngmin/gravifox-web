import http from "./http";
import { ADMIN_ENDPOINTS } from "./endPointRoute";

export async function fetchAdminUsers(params = {}) {
  const response = await http.get(ADMIN_ENDPOINTS.USERS, { params });
  return response.data;
}

export async function fetchAdminLatestAnalysisReports(params = {}) {
  const response = await http.get(ADMIN_ENDPOINTS.ANALYSIS_REPORTS_LATEST, { params });
  return response.data;
}

export async function resetAdminUserQuota(userNo) {
  if (userNo == null) return;
  await http.post(`${ADMIN_ENDPOINTS.USERS}/${userNo}/usage/reset`);
}

export async function previewAdminEmail(payload = {}) {
  const response = await http.post(ADMIN_ENDPOINTS.EMAIL_PREVIEW, payload);
  return response.data;
}

export async function sendAdminEmail(payload = {}) {
  const response = await http.post(ADMIN_ENDPOINTS.EMAIL_SEND, payload);
  return response.data;
}
