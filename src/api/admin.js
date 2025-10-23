import http from "./http";
import { ADMIN_ENDPOINTS } from "./endPointRoute";

export async function fetchAdminUsers(params = {}) {
  const response = await http.get(ADMIN_ENDPOINTS.USERS, { params });
  return response.data;
}

export async function resetAdminUserQuota(userNo) {
  if (userNo == null) return;
  await http.post(`${ADMIN_ENDPOINTS.USERS}/${userNo}/usage/reset`);
}
