import React, {useEffect, useRef, useState} from "react";
import HowItWorksHeader from "./components/HowItworksHeader";
import SampleChoiceBox from "./components/SampleChoiceBox";
import StepsGrid from "./components/StepsGrid";
import ToolTip from "./components/ToolTip";
import Faq from "./components/Faq";
import UploadPanel from "./components/upload/UploadPanel";

/**
 * HowItWorksSection
 * - Clear, scannable "How it works" with 3 steps
 * - Secondary facts row: supported formats, typical time, delivery options
 * - Trust note: privacy & deletion policy
 * - Microcopy tuned for first‑time visitors
 *
 * Tailwind only. Drop into any page (e.g., /app/page.tsx) and place under the hero.
 */
export default function HowItWorksSection({ theme = 'light' }) {
    const [files, setFiles] = useState([]);
    const [picking, setPicking] = useState(null);
    const uploadRef = useRef(null);
    const isDark = theme === 'dark';

    useEffect(() => {
        try {
            if (typeof window !== 'undefined' && window.location?.hash === '#upload') {
                uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch (_) {}
    }, []);
    async function handleSamplePick(kind) {
        try {
            setPicking(kind);
            const base = process.env.PUBLIC_URL || "";
            const url =
                kind === "image"
                    ? `${base}/samples/face-sample.jpg`
                    : `${base}/samples/video-sample.mp4`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("fetch failed");
            const blob = await res.blob();
            const file = new File(
                [blob],
                kind === "image" ? "face-sample.jpg" : "video-sample.mp4",
                {
                type: blob.type || (kind === "image" ? "image/jpeg" : "video/mp4"),
                }
            );
            setFiles(prev => [...prev, file]);
        } catch (e) {
            alert("샘플을 자동으로 불러오지 못했습니다. 다운로드 후 직접 업로드해 주세요.");
        } finally {
            setPicking(null);
        }
    }


    return (
        <section
            className={`mt-12 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
                isDark ? 'text-slate-100' : 'text-slate-900'
            }`}
        >
            <HowItWorksHeader theme={theme} />
            <SampleChoiceBox onPick={handleSamplePick} picking={picking} theme={theme} />
            <StepsGrid theme={theme} />
            <ToolTip theme={theme} />
            <div id="upload" ref={uploadRef}>
                <UploadPanel files={files} setFiles={setFiles} theme={theme} />
            </div>
            <Faq theme={theme} />


        </section>
    );
}
