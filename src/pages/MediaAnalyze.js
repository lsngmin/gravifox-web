import React from "react";
import Navigation from "../features/navigation/navigation";
import Footer from "../features/footer/footer";
import HowItWorksSection from "../features/analyze/HowItWorksSection";
// ErrorModal, 테스트용 업로드 API는 제거

export default function MediaAnalyze() {
    return (
        <div className="min-h-screen bg-white font-sans flex flex-col">
            {/* 네비게이션 재사용 */}
            {/** Navigation은 전역 헤더 역할을 하며, 메인과 동일하게 재사용합니다. */}
            <Navigation/>
            <main className="flex-1 pt-28 sm:pt-32 lg:pt-36 pb-16">
                {/* 본문 카드 */}
                <HowItWorksSection />
            </main>
            {/* 테스트용 버튼/모달 제거됨 */}
            <Footer/>
        </div>
    );
}
