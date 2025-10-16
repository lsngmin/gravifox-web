import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import submitAnalyzeFiles from "../../api/submitAnalyze";
import CloudUploadIcon from "./CloudUploadIcon";
import UploadDropzone from "./UploadDropzone";
import UploadHint from "./UploadHint";
import UploadActions from "./UploadActions";
import FilePreviewCard from "./FilePreviewCard";
import MobileFilePreviewItem from "../mobile/MobileFilePreviewItem";
import UploadMoreNote from "./UploadMoreNote";
import ErrorModal from "../ErrorModal";
import { persistPreviewForJob } from "../../../../utils/previewStore";

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

function TypeCounters({ files, dark = false }) {
    const imgCount = files.filter(isImage).length;
    const vidCount = files.filter(isVideo).length;
    const wrap = 'mb-2 flex items-center gap-2';
    const pill = dark
        ? 'inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-xs font-medium text-slate-200'
        : 'inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700';
    const count = dark
        ? 'rounded-full border border-slate-600 bg-slate-900/70 px-2 py-0.5 text-[11px] text-slate-100'
        : 'rounded-full bg-slate-200 px-2 py-0.5 text-[11px] text-slate-800';
    return (
        <div className={wrap}>
            <div className={pill}>
                <span>이미지</span>
                <span className={count}>{imgCount}/{MAX_IMAGE_FILES}</span>
            </div>
            <div className={pill}>
                <span>동영상</span>
                <span className={count}>{vidCount}/{MAX_VIDEO_FILES}</span>
            </div>
        </div>
    );
}

export default function UploadPanel({
    files = [],
    setFiles,
    className = "",
    dropzoneClassName = "",
    hintClassName = "",
    variant = 'default', // 'default' | 'mobile'
    analyzeLabel,
    onAnalyzeOverride = null,
    hideReset = false,
    selectedModelKey,
}) {
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
        if (typeof onAnalyzeOverride === 'function') {
            try {
                await Promise.resolve(onAnalyzeOverride(arr));
            } catch (e) {
                const msg = e?.message || "분석을 시작할 수 없어요. 다시 시도해 주세요.";
                setErrorMsgs([msg]);
                setErrorOpen(true);
            }
            return;
        }

        if (!arr?.length || submitting) return;
        setSubmitting(true);
        setErrorMsgs([]);
        setErrorOpen(false);
        setPendingResultPath(null);
        try {
            const { jobIds, errors: uploadErrors, remainingQuota } = await submitAnalyzeFiles(arr, {
                modelKey: selectedModelKey,
                buildMeta: async (file) => ({
                    name: file?.name,
                    size: file?.size,
                    type: file?.type,
                }),
                afterAnalyze: async (file, analyzeJson) => {
                    if (!file || !analyzeJson?.jobId) return;
                    await persistPreviewForJob(analyzeJson.jobId, file);
                },
            });

            if (!jobIds.length) {
                const fallback = uploadErrors.length > 0 ? uploadErrors : ["분석을 시작할 수 없어요. 다시 시도해 주세요."];
                setErrorMsgs(fallback);
                setErrorOpen(true);
                return;
            }

            const resultPath = localizedPath(`/analyze/desktop/result?jobIds=${encodeURIComponent(jobIds.join(","))}`);

            if (uploadErrors.length > 0) {
                setErrorMsgs(uploadErrors);
                setErrorOpen(true);
                setPendingResultPath(resultPath);
                return;
            }

            setPendingResultPath(null);
            navigate(resultPath);
        } catch (e) {
            const status = e?.status;
            const code = e?.code;
            if (status === 401) {
                setErrorMsgs(["Login is required. Please sign in and try again."]);
            } else if (status === 403 && code === "email_not_verified") {
                setErrorMsgs(["Please verify your email address before running an analysis."]);
            } else if (status === 429 || code === "quota_exhausted") {
                setErrorMsgs(["Monthly analysis quota has been exhausted."]);
            } else {
                const msg = e?.message || "분석 시작 중 오류가 발생했어요.";
                setErrorMsgs([msg]);
            }
            setErrorOpen(true);
            setPendingResultPath(null);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={`mx-auto mt-6 rounded-2xl border bg-white p-4 border-slate-200 ${className}`}>
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
                theme={className?.includes('bg-slate-') ? 'dark' : 'light'}
            />
            {files.length === 0 && (
                <UploadDropzone
                    dragOver={dragOver}
                    setDragOver={setDragOver}
                    onDropFiles={(fl) => addFiles(fl)}
                    className={dropzoneClassName}
                >
                    <CloudUploadIcon />
                    <UploadHint
                        multiple
                        onFiles={(fl) => addFiles(fl)}
                        accept={ACCEPT_MIME}
                        className={hintClassName}
                        textClassName={hintClassName}
                        labelClassName={hintClassName}
                    />
                </UploadDropzone>
            )}
            {files.length > 0 && (
                <>
                    {/* 선택 파일 카운터 (타입별) */}
                    <TypeCounters files={files} dark={className?.includes('bg-slate-')} />

                    {variant === 'mobile' ? (
                        <div className="grid grid-cols-1 gap-4">
                            {files.map((f, i) => (
                                <MobileFilePreviewItem key={`${f.name}_${f.size}_${i}`} file={f} onRemove={() => removeAt(i)} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {files.map((f, i) => (
                                <FilePreviewCard
                                    key={`${f.name}_${f.size}_${i}`}
                                    file={f}
                                    onRemove={() => removeAt(i)}
                                    variant={className?.includes('bg-slate-') ? 'dark' : 'light'}
                                />
                            ))}
                        </div>
                    )}

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
                analyzeLabel={analyzeLabel}
                hideReset={hideReset}
                className="mt-6"
            />
            {submitting && (
                <div className="mt-3 text-sm text-slate-600">분석을 시작하고 있어요…</div>
            )}
        </div>
    );
}
