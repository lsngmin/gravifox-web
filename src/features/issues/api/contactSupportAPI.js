import axios from "axios";
import { useAuth } from "providers/authProvider";
import { ISSUE_ENDPOINTS } from "api/endPointRoute";

const ContactSupportAPI = () => {
    const { accessToken } = useAuth();

    const submitContact = (formData) => {
        if (!formData) {
            throw new Error("formData is required to contact support.");
        }

        formData.append("category", "support-contact");

        return axios.post(ISSUE_ENDPOINTS.CREATE_ISSUE, formData, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
        });
    };

    return { submitContact };
};

export default ContactSupportAPI;
