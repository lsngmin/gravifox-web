import React, { useMemo, useState } from "react";
import CloudUploadIcon from "./CloudUploadIcon";
import UploadDropzone from "./UploadDropzone";
import UploadHint from "./UploadHint";
import SelectedFileInfo from "./SelectedFileInfo";
import UploadActions from "./UploadActions";
import FilePreviewCard from "./FilePreviewCard";
import UploadMoreNote from "./UploadMoreNote";

const MAX_FILES = 5;
const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_PREFIX = ["image/", "video/"];

export default function UploadPanel({ files = [], setFiles }) {
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState(null);


    const addFiles = (incoming) => {
        setError(null);
        const list = Array.from(incoming || []);
        if (!list.length) return;

        const existKey = new Set(files.map(f => `${f.name}_${f.size}`));
        const next = [...files];

        for (const f of list) {
            const okType = ALLOWED_PREFIX.some(p => f.type?.startsWith(p));
            if (!okType) { setError("이미지/비디오만 업로드할 수 있어요."); continue; }
            if (f.size > MAX_SIZE) { setError("파일 용량은 최대 10MB까지 지원해요."); continue; }
            const key = `${f.name}_${f.size}`;
            if (existKey.has(key)) continue; // 중복 방지
            next.push(f);
            if (next.length >= MAX_FILES) break;
        }

        if (next.length > MAX_FILES) {
            setError(`최대 ${MAX_FILES}개까지 업로드할 수 있어요.`);
        }
        setFiles(next.slice(0, MAX_FILES));
    };

    const removeAt = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));
    const resetAll = () => { setFiles([]); setError(null); };
    const analyze = (arr) => {
        if (!arr?.length) return;
        // TODO: 업로드→잡 생성→/result/[jobId] 이동
        console.log("분석 시작(다중)", arr);
    };

    return (
        <div className="mx-auto mt-6 rounded-2xl border border-slate-200 bg-white p-4">
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
                    />
                </UploadDropzone>
            )}
            {files.length > 0 && (
                <>
                    <div className="grid grid-cols-1 gap-4">
                        {files.map((f, i) => (
                            <FilePreviewCard key={`${f.name}_${f.size}_${i}`} file={f} onRemove={() => removeAt(i)} />
                        ))}
                    </div>

                    {/* 추가 업로드 안내 + 버튼 */}
                    <UploadMoreNote
                        className="mt-3"
                        onAdd={(file) => addFiles([file])}
                        accept="image/*,video/*"
                    />
                </>
            )}

            <UploadActions
                files={files}
                onAnalyze={analyze}
                onReset={resetAll}
                className="mt-6"
            />
        </div>
    );
}
