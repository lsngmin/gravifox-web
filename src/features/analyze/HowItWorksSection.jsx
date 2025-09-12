import React, {useState} from "react";
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
export default function HowItWorksSection() {
    const [files, setFiles] = useState([]);
    const [picking, setPicking] = useState(null);

    async function handleSamplePick(kind) {
        try {
            setPicking(kind);
            const url =
                kind === "image" ? "/samples/face-sample.jpg" : "/samples/video-sample.mp4";
            const res = await fetch(url);
            if (!res.ok) throw new Error("fetch failed");
            const blob = await res.blob();
            const file = new File([blob], kind === "image" ? "sample.jpg" : "sample.mp4", {
                type: blob.type || (kind === "image" ? "image/jpeg" : "video/mp4"),
            });
            setFiles(prev => [...prev, file]);
        } catch (e) {
            alert("샘플을 자동으로 불러오지 못했습니다. 다운로드 후 직접 업로드해 주세요.");
        } finally {
            setPicking(null);
        }
    }


    return (
        <section className="mt-12 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
            <HowItWorksHeader />
            <SampleChoiceBox onPick={handleSamplePick} picking={picking}/>
            <StepsGrid/>
            <ToolTip/>
            <UploadPanel files={files} setFiles={setFiles} />
            <Faq/>
        </section>
    );
}
