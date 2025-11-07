import axios from "axios";
import { useAuth } from "providers/authProvider";
import { ISSUE_ENDPOINTS } from "api/endPointRoute";

const IssueAdminAPI = () => {
  const { accessToken } = useAuth();

  const updateState = async (id, state) => {
    if (id == null) throw new Error("id is required");
    const url = ISSUE_ENDPOINTS.UPDATE_STATE(id);
    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    // Send as query param; body null for PATCH
    const resp = await axios.patch(url, null, { params: { state }, headers, withCredentials: true });
    return resp.data;
  };

  return { updateState };
};

export default IssueAdminAPI;

