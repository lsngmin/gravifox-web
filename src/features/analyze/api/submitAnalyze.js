import { ANALYZE_ENDPOINTS, FASTAPI_ENDPOINTS } from "../../../api/endPointRoute";

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
} = {}) {
    const jobIds = [];
    const errors = [];
    if (!Array.isArray(files) || files.length === 0) {
        return { jobIds, errors };
    }
    if (!FASTAPI_ENDPOINTS.UPLOAD) {
        throw new Error("업로드 엔드포인트가 설정되지 않았어요. 환경 변수를 확인해 주세요.");
    }

    const modelKeyTrimmed = typeof modelKey === "string" && modelKey.trim().length > 0 ? modelKey.trim() : undefined;

    for (const file of files) {
        try {
            const form = new FormData();
            form.append("file", file, file?.name || "media");

            const uploadResp = await fetch(FASTAPI_ENDPOINTS.UPLOAD, {
                method: "POST",
                body: form,
            });
            if (!uploadResp.ok) {
                const detail = await toJson(uploadResp);
                const reason = detail?.detail || uploadResp.statusText || "업로드에 실패했어요.";
                errors.push(reason);
                continue;
            }
            const uploadJson = await toJson(uploadResp);
            const uploadId = uploadJson?.uploadId;
            if (!uploadId) {
                errors.push("uploadId를 받지 못했어요.");
                continue;
            }

            const body = { uploadId };
            if (modelKeyTrimmed) body.modelKey = modelKeyTrimmed;

            const mergedParams = { ...(params || {}) };
            if (typeof buildParams === "function") {
                try {
                    const extra = buildParams(file, uploadJson);
                    if (extra && typeof extra === "object") {
                        Object.assign(mergedParams, extra);
                    }
                } catch {}
            }
            if (Object.keys(mergedParams).length > 0) {
                body.params = mergedParams;
            }

            const analyzeResp = await fetch(ANALYZE_ENDPOINTS.CREATE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!analyzeResp.ok) {
                const detail = await toJson(analyzeResp);
                const reason = detail?.message || detail?.error || analyzeResp.statusText || "분석 생성에 실패했어요.";
                errors.push(reason);
                continue;
            }
            const analyzeJson = await toJson(analyzeResp);
            const jobId = analyzeJson?.jobId;
            const token = analyzeJson?.sseToken;
            const resolvedModelKey = analyzeJson?.modelKey || modelKeyTrimmed;
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
                };
                if (typeof buildMeta === "function") {
                    try {
                        const extraMeta = buildMeta(file, analyzeJson) || {};
                        Object.assign(baseMeta, extraMeta);
                    } catch {}
                }
                sessionStorage.setItem(`sse:meta:${jobId}`, JSON.stringify(baseMeta));
            } catch {}
            jobIds.push(jobId);
        } catch (err) {
            const message = err?.message || "분석 처리 중 오류가 발생했어요.";
            errors.push(message);
        }
    }
    return { jobIds, errors };
}

export default submitAnalyzeFiles;
