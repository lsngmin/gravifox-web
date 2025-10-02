import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import Navigation from "../features/navigation/navigation";
import Footer from "../features/footer/footer";
import HowItWorksSection from "../features/analyze/HowItWorksSection";
// ErrorModal, 테스트용 업로드 API는 제거

export default function MediaAnalyze() {
    const navigate = useNavigate();
    const [dragOver, setDragOver] = useState(false);
    const [file, setFile] = useState(null);
    const [faqOpenMap, setFaqOpenMap] = useState({a: false, b: false, c: false});
    const toggle = id => setFaqOpenMap(s => ({...s, [id]: !s[id]}));
    // 테스트용 상태/훅 제거

    const onDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) setFile(f);
    };
    const onChange = (e) => {
        const f = e.target.files?.[0];
        if (f) setFile(f);
    };

    // 테스트 핸들러 제거

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col">
            {/* 네비게이션 재사용 */}
            {/** Navigation은 전역 헤더 역할을 하며, 메인과 동일하게 재사용합니다. */}
            <Navigation/>
            <main className="flex-1 pt-24 sm:pt-28 lg:pt-32 pb-16">
                {/* 본문 카드 */}
                <HowItWorksSection />
            </main>
            {/* 테스트용 버튼/모달 제거됨 */}
            <Footer/>
        </div>
    );
}
