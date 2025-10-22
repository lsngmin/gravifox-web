import http from "./http";
import { ADMIN_ENDPOINTS } from "./endPointRoute";

export async function fetchAdminUsers(params = {}) {
  const response = await http.get(ADMIN_ENDPOINTS.USERS, { params });
  return response.data;
}
