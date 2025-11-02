import axios from "axios";
import { useAuth } from "providers/authProvider";
import { ISSUE_ENDPOINTS } from "api/endPointRoute";

const IssueReportAPI = () => {
    const { accessToken } = useAuth();

    const submitIssue = async (formData) => {
        if (!formData) {
            throw new Error("formData is required to submit an issue.");
        }

        return axios.post(ISSUE_ENDPOINTS.CREATE_ISSUE, formData, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
        });
    };

    return { submitIssue };
};

export default IssueReportAPI;

