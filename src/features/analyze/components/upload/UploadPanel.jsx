import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FASTAPI_ENDPOINTS, ANALYZE_ENDPOINTS } from "../../../../api/endPointRoute";
import CloudUploadIcon from "./CloudUploadIcon";
import UploadDropzone from "./UploadDropzone";
import UploadHint from "./UploadHint";
import UploadActions from "./UploadActions";
import FilePreviewCard from "./FilePreviewCard";
import UploadMoreNote from "./UploadMoreNote";
import ErrorModal from "../ErrorModal";

const MAX_IMAGE_FILES = 3;
const MAX_VIDEO_FILES = 2;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;  // 50MB

// 허용 확장자/타입 (이미지: JPEG, JPG, PNG, WEBP / 비디오: WEBM, MP4, MOV)
const IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);
const VIDEO_MIMES = new Set(["video/webm", "video/mp4", "video/quicktime"]); // MOV
const IMAGE_EXTS = new Set(["jpeg", "jpg", "png", "webp"]);
const VIDEO_EXTS = new Set(["webm", "mp4", "mov"]);
const ACCEPT_MIME = [...IMAGE_MIMES, ...VIDEO_MIMES].join(",");
const getExt = (file) => {
    const name = (file?.name || "").toLowerCase();
    const idx = name.lastIndexOf(".");
    return idx !== -1 ? name.slice(idx + 1) : "";
};

function isImage(file) {
    const type = (file?.type || "").toLowerCase();
    if (IMAGE_MIMES.has(type)) return true;
    return IMAGE_EXTS.has(getExt(file));
}

function isVideo(file) {
    const type = (file?.type || "").toLowerCase();
    if (VIDEO_MIMES.has(type)) return true;
    return VIDEO_EXTS.has(getExt(file));
}

function isAllowedFile(file) {
    return isImage(file) || isVideo(file);
}

function TypeCounters({ files }) {
    const imgCount = files.filter(isImage).length;
    const vidCount = files.filter(isVideo).length;
    return (
        <div className="mb-2 flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                <span>이미지</span>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] text-slate-800">{imgCount}/{MAX_IMAGE_FILES}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                <span>동영상</span>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] text-slate-800">{vidCount}/{MAX_VIDEO_FILES}</span>
            </div>
        </div>
    );
}

export default function UploadPanel({ files = [], setFiles }) {
    const [dragOver, setDragOver] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMsgs, setErrorMsgs] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [pendingResultPath, setPendingResultPath] = useState(null);
    const navigate = useNavigate();
    const { lng } = useParams();
    const localizedPath = (path) => {
        const prefix = lng ? `/${lng}` : "";
        if (path === "/" && prefix) {
            return prefix;
        }
        return `${prefix}${path}`;
    };


    const addFiles = (incoming) => {
        const list = Array.from(incoming || []);
        if (!list.length) return;

        const existKey = new Set(files.map(f => `${f.name}_${f.size}_${f.lastModified}`));
        const next = [...files];
        const dupMsgs = [];
        let invalidTypeFound = false;
        let oversizeFound = false;
        let imageLimitHit = false;
        let videoLimitHit = false;

        // 현재 선택된 이미지/비디오 개수 카운트
        let currentImageCount = files.filter(isImage).length;
        let currentVideoCount = files.filter(isVideo).length;

        for (const f of list) {
            const okType = isAllowedFile(f);
            if (!okType) { invalidTypeFound = true; continue; }
            const tooBig = (isImage(f) && f.size > MAX_IMAGE_SIZE) || (isVideo(f) && f.size > MAX_VIDEO_SIZE);
            if (tooBig) { oversizeFound = true; continue; }
            const key = `${f.name}_${f.size}_${f.lastModified}`;
            // 중복 업로드 예외: 이미 업로드된 목록이 있을 때만 검사/표시
            if (files.length > 0 && existKey.has(key)) {
                dupMsgs.push("이미 추가한 파일이에요.");
                continue; // 중복 방지
            }
            // 타입별 최대 개수 제한 검사
            if (isImage(f)) {
                if (currentImageCount >= MAX_IMAGE_FILES) { imageLimitHit = true; continue; }
                currentImageCount += 1;
            } else if (isVideo(f)) {
                if (currentVideoCount >= MAX_VIDEO_FILES) { videoLimitHit = true; continue; }
                currentVideoCount += 1;
            }
            next.push(f);
        }

        setFiles(next);

        const msgs = [];
        if (invalidTypeFound) {
            msgs.push("지원하지 않는 파일 형식이에요.");
            msgs.push("허용 형식: JPEG, JPG, PNG, WEBP / WEBM, MP4, MOV");
        }
        if (oversizeFound) {
            msgs.push("파일 용량 제한을 초과했어요.");
            msgs.push("이미지 최대 5MB, 동영상 최대 50MB");
        }
        if (dupMsgs.length > 0) {
            msgs.push(...dupMsgs);
        }
        if (imageLimitHit) {
            msgs.push(`이미지는 최대 ${MAX_IMAGE_FILES}장까지만 업로드할 수 있어요.`);
        }
        if (videoLimitHit) {
            msgs.push(`동영상은 최대 ${MAX_VIDEO_FILES}개까지만 업로드할 수 있어요.`);
        }
        if (msgs.length > 0) {
            setErrorMsgs(msgs);
            setErrorOpen(true);
        }
    };

    const removeAt = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));
    const resetAll = () => { setFiles([]); };
    const analyze = async (arr) => {
        if (!arr?.length || submitting) return;
        const localErrors = [];
        setSubmitting(true);
        setErrorMsgs([]);
        setErrorOpen(false);
        setPendingResultPath(null);
        try {
            if (!FASTAPI_ENDPOINTS.UPLOAD) {
                throw new Error("업로드 엔드포인트가 설정되지 않았어요. 환경 변수를 확인해 주세요.");
            }
            const jobIds = [];
            // 순차 처리: 업로드 → 분석 생성 반복
            for (let i = 0; i < arr.length; i++) {
                const file = arr[i];
                try {
                    // 1) 업로드
                    const form = new FormData();
                    form.append("file", file, file.name || "media");
                    const upRes = await fetch(FASTAPI_ENDPOINTS.UPLOAD, { method: "POST", body: form });
                    if (!upRes.ok) throw new Error("업로드에 실패했어요.");
                    const upJson = await upRes.json();
                    const uploadId = upJson?.uploadId;
                    if (!uploadId) throw new Error("uploadId를 받지 못했어요.");

                    // 2) 분석 생성
                    const anRes = await fetch(ANALYZE_ENDPOINTS.CREATE, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ uploadId }),
                    });
                    if (!anRes.ok) throw new Error("분석 생성에 실패했어요.");
                    const anJson = await anRes.json();
                    const { jobId, sseToken } = anJson || {};
                    if (!jobId || !sseToken) throw new Error("jobId 또는 sseToken이 없어요.");

                    // 3) 토큰/메타 저장 (URL에는 토큰 노출 X)
                    try {
                        sessionStorage.setItem(`sse:${jobId}`, sseToken);
                        sessionStorage.setItem(`sse:meta:${jobId}`, JSON.stringify({
                            name: file.name,
                            size: file.size,
                            type: file.type,
                        }));
                    } catch {}
                    jobIds.push(jobId);
                } catch (inner) {
                    // 파일 단위 오류는 누적해서 모달에 보여주고 계속 진행
                    const msg = inner?.message || `${file.name} 처리 중 오류가 발생했어요.`;
                    localErrors.push(msg);
                }
            }

            if (jobIds.length === 0) {
                if (localErrors.length === 0) {
                    localErrors.push("분석을 시작할 수 없어요. 다시 시도해 주세요.");
                }
                setErrorMsgs(localErrors);
                setErrorOpen(true);
                return;
            }

            const resultPath = localizedPath(`/analyze/result?jobIds=${encodeURIComponent(jobIds.join(","))}`);

            if (localErrors.length > 0) {
                setErrorMsgs(localErrors);
                setErrorOpen(true);
                setPendingResultPath(resultPath);
                return;
            }

            // 4) 결과 페이지로 이동 (다중 전용)
            setPendingResultPath(null);
            navigate(resultPath);
        } catch (e) {
            const msg = e?.message || "분석 시작 중 오류가 발생했어요.";
            setErrorMsgs([msg]);
            setErrorOpen(true);
            setPendingResultPath(null);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto mt-6 rounded-2xl border border-slate-200 bg-white p-4">
            <ErrorModal
                open={errorOpen}
                messages={errorMsgs}
                onClose={() => {
                    setErrorOpen(false);
                    setErrorMsgs([]);
                    if (pendingResultPath) {
                        const next = pendingResultPath;
                        setPendingResultPath(null);
                        navigate(next);
                    }
                }}
                title="업로드 오류"
            />
            {files.length === 0 && (
                <UploadDropzone
                    dragOver={dragOver}
                    setDragOver={setDragOver}
                    onDropFiles={(fl) => addFiles(fl)}
                >
                    <CloudUploadIcon />
                    <UploadHint
                        multiple
                        onFiles={(fl) => addFiles(fl)}
                        accept={ACCEPT_MIME}
                    />
                </UploadDropzone>
            )}
            {files.length > 0 && (
                <>
                    {/* 선택 파일 카운터 (타입별) */}
                    <TypeCounters files={files} />

                    <div className="grid grid-cols-1 gap-4">
                        {files.map((f, i) => (
                            <FilePreviewCard key={`${f.name}_${f.size}_${i}`} file={f} onRemove={() => removeAt(i)} />
                        ))}
                    </div>

                    {/* 추가 업로드 안내 + 버튼 */}
                    <UploadMoreNote
                        className="mt-3"
                        onAdd={(file) => addFiles([file])}
                        accept={ACCEPT_MIME}
                    />
                </>
            )}

            <UploadActions
                files={files}
                onAnalyze={analyze}
                onReset={resetAll}
                className="mt-6"
            />
            {submitting && (
                <div className="mt-3 text-sm text-slate-600">분석을 시작하고 있어요…</div>
            )}
        </div>
    );
}
