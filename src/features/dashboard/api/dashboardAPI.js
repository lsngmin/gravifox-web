import { useCallback } from "react";
import axios from "axios";
import {useAuth} from "providers/authProvider";
import {ANALYSIS_REPORT_ENDPOINTS, DASHBOARD_ENDPOINTS} from "../../../api/endPointRoute";

export const DashboardAPI = () => {

    const {accessToken} = useAuth();

    const fetchData = async () => {
        try {
            return await axios.get(DASHBOARD_ENDPOINTS.GET_INFO, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }, withCredentials: true
            })
        } catch (err) {
            console.error("데이터 불러오기 실패:", err);
        }
    }
    return {fetchData}
}

export const GenerateApiKeyAPI = () => {
    const {accessToken} = useAuth();

    const generateToken = async () => {
        try {
            return await axios.post(DASHBOARD_ENDPOINTS.GENERATE, {}, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }, withCredentials: true
            })
        } catch (err) {
            console.error("데이터 불러오기 실패:", err);
        }
    }
    return {generateToken}
}

export const AnalysisReportAPI = () => {
    const { accessToken } = useAuth();

    const buildAuthHeaders = () => {
        const headers = {};
        if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return headers;
    };

    const fetchReports = useCallback(async ({ page = 0, size = 10, mediaType } = {}) => {
        try {
            const params = { page, size };
            if (mediaType) {
                params.mediaType = mediaType;
            }
            const response = await axios.get(ANALYSIS_REPORT_ENDPOINTS.LIST, {
                headers: buildAuthHeaders(),
                params,
                withCredentials: true,
            });
            return response?.data;
        } catch (err) {
            console.error("분석 리포트를 불러오지 못했어요:", err);
            throw err;
        }
    }, [accessToken]);

    const fetchReportDetail = useCallback(async (uploadId) => {
        if (!uploadId) return null;
        try {
            const response = await axios.get(ANALYSIS_REPORT_ENDPOINTS.DETAIL(uploadId), {
                headers: buildAuthHeaders(),
                withCredentials: true,
            });
            return response?.data;
        } catch (err) {
            console.error("분석 리포트 상세를 불러오지 못했어요:", err);
            throw err;
        }
    }, [accessToken]);

    return { fetchReports, fetchReportDetail };
};
