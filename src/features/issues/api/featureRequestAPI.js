import axios from "axios";
import { useAuth } from "providers/authProvider";
import { ISSUE_ENDPOINTS } from "api/endPointRoute";

const FeatureRequestAPI = () => {
    const { accessToken } = useAuth();

    const submitFeature = (formData) => {
        if (!formData) {
            throw new Error("formData is required to submit a feature request.");
        }

        formData.append("category", "feature-request");

        return axios.post(ISSUE_ENDPOINTS.CREATE_ISSUE, formData, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
        });
    };

    return { submitFeature };
};

export default FeatureRequestAPI;
