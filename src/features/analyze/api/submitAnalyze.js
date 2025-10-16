import axios from "../../../api/http";
import { ANALYZE_ENDPOINTS, FASTAPI_ENDPOINTS } from "../../../api/endPointRoute";
import ensureUploadToken from "./uploadTokenClient";

const toJson = async (response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};

export async function submitAnalyzeFiles(files, {
    modelKey,
    params = {},
    buildParams,
    buildMeta,
    afterAnalyze,
} = {}) {
    const jobIds = [];
    const errors = [];
    let lastRemainingQuota = null;
    if (!Array.isArray(files) || files.length === 0) {
        return { jobIds, errors };
    }
    if (!FASTAPI_ENDPOINTS.UPLOAD) {
        throw new Error("업로드 엔드포인트가 설정되지 않았어요. 환경 변수를 확인해 주세요.");
    }

    const modelKeyTrimmed = typeof modelKey === "string" && modelKey.trim().length > 0 ? modelKey.trim() : undefined;

    for (const file of files) {
        try {
            let uploadId;
            let uploadToken;
            try {
                const tokenPayload = await ensureUploadToken(file);
                uploadId = tokenPayload?.uploadId;
                uploadToken = tokenPayload?.uploadToken;
            } catch (issueErr) {
                const status = issueErr?.response?.status;
                const detail = issueErr?.response?.data;
                if (status === 401 || status === 403) {
                    const err = new Error(detail?.message || detail?.error || "업로드 토큰 발급이 거부됐어요.");
                    err.status = status;
                    throw err;
                }
                throw new Error(detail?.message || detail?.error || issueErr?.message || "업로드 토큰을 발급받지 못했어요.");
            }

            const form = new FormData();
            form.append("file", file, file?.name || "media");
            form.append("uploadId", uploadId);

            const uploadResp = await fetch(FASTAPI_ENDPOINTS.UPLOAD, {
                method: "POST",
                headers: {
                    "Upload-Token": uploadToken,
                },
                body: form,
            });
            if (!uploadResp.ok) {
                const detail = await toJson(uploadResp);
                const reason = detail?.detail || uploadResp.statusText || "업로드에 실패했어요.";
                errors.push(reason);
                continue;
            }
            const uploadJson = await toJson(uploadResp);
            const resolvedUploadId = uploadJson?.uploadId || uploadId;
            if (!resolvedUploadId) {
                errors.push("uploadId를 확인하지 못했어요.");
                continue;
            }

            const body = { uploadId: resolvedUploadId };
            if (modelKeyTrimmed) body.modelKey = modelKeyTrimmed;

            const mergedParams = { ...(params || {}) };
            if (typeof buildParams === "function") {
                try {
                    const extra = buildParams(file, { ...(uploadJson || {}), uploadId: resolvedUploadId });
                    if (extra && typeof extra === "object") {
                        Object.assign(mergedParams, extra);
                    }
                } catch {}
            }
            if (Object.keys(mergedParams).length > 0) {
                body.params = mergedParams;
            }

            let analyzeJson;
            try {
                const analyzeResp = await axios.post(ANALYZE_ENDPOINTS.CREATE, body);
                analyzeJson = analyzeResp?.data;
            } catch (error) {
                const resp = error?.response;
                const detail = resp?.data;
                const reason = detail?.message || detail?.error || detail?.code || resp?.statusText || error?.message || "분석 생성에 실패했어요.";
                const status = resp?.status;
                if (status === 401 || status === 403 || status === 429) {
                    const err = new Error(reason);
                    err.status = status;
                    err.code = detail?.error || detail?.code;
                    throw err;
                }
                errors.push(reason);
                continue;
            }
            const jobId = analyzeJson?.jobId;
            const token = analyzeJson?.sseToken;
            const resolvedModelKey = analyzeJson?.modelKey || modelKeyTrimmed;
            if (typeof analyzeJson?.remainingQuota === "number") {
                lastRemainingQuota = analyzeJson.remainingQuota;
            }
            if (!jobId || !token) {
                errors.push("jobId 또는 sseToken이 없어요.");
                continue;
            }

            try {
                sessionStorage.setItem(`sse:${jobId}`, token);
                const baseMeta = {
                    name: file?.name,
                    size: file?.size,
                    type: file?.type,
                    modelKey: resolvedModelKey,
                    uploadId: resolvedUploadId,
                };
                if (typeof buildMeta === "function") {
                    try {
                        const extraMetaMaybe = buildMeta(file, analyzeJson);
                        const extraMeta = extraMetaMaybe && typeof extraMetaMaybe.then === "function"
                            ? await extraMetaMaybe
                            : extraMetaMaybe;
                        if (extraMeta && typeof extraMeta === "object") {
                            Object.assign(baseMeta, extraMeta);
                        }
                    } catch {}
                }
                sessionStorage.setItem(`sse:meta:${jobId}`, JSON.stringify(baseMeta));
                if (typeof afterAnalyze === "function") {
                    try {
                        await afterAnalyze(file, { ...analyzeJson, jobId, modelKey: resolvedModelKey, uploadId: resolvedUploadId }, baseMeta);
                    } catch {}
                }
            } catch {}
            jobIds.push(jobId);
        } catch (err) {
            const message = err?.message || "분석 처리 중 오류가 발생했어요.";
            if (err?.status === 401 || err?.status === 403) {
                throw err;
            }
            errors.push(message);
        }
    }
    return { jobIds, errors, remainingQuota: lastRemainingQuota };
}

export default submitAnalyzeFiles;
