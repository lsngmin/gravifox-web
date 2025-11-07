import axios from "axios";
import { useCallback } from "react";
import { useAuth } from "providers/authProvider";
import { ISSUE_ENDPOINTS } from "../../../api/endPointRoute";

const IssueFetchDataAPI = () => {
    const { accessToken } = useAuth();

    /**
     * gitHub에 있는 버그 라벨로 되어 있는 이슈의 목록들을 가져옵니다.
     *
     * @returns {Promise<axios.AxiosResponse<any>>} - 반환값은 API Get 요청을 통해 받아온 JSON 형태의 이슈들 입니다.
     */
    const fetchData = useCallback(async () => {
        try {
            return await axios.get(ISSUE_ENDPOINTS.GET_ISSUE, {
                headers: accessToken ? { "Authorization": `Bearer ${accessToken}` } : {},
                withCredentials: true,
            });
        } catch (err) {
            // 표면화된 에러는 호출측에서 처리할 수 있도록 다시 throw
            console.error("데이터 불러오기 실패:", err);
            throw err;
        }
    }, [accessToken]);
    return {fetchData}
}
export default IssueFetchDataAPI;
