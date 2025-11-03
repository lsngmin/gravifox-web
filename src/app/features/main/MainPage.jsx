import Header from "../../layout/Header";

import PageHero from "./sections/PageHero";

import AnchorNav from "./components/AnchorNav";
import ContentDecor from "./components/ContentDecor";
import FeatureHighlights from "./sections/FeatureHighlights";
import HowItWorksSection from "./sections/HowItWorksSection";
import UseCasesSection from "./sections/UseCasesSection";
import SupportedInputsSection from "./sections/SupportedInputsSection";
import SampleOutputSection from "./sections/SampleOutputSection";
import SecurityPrivacySection from "./sections/SecurityPrivacySection";
import FAQSection from "./sections/FAQSection";

export default function MainPage() {
    return (
        <>
            <Header />
            <main>
                <PageHero />
                <AnchorNav />
                <ContentDecor>
                    <HowItWorksSection />
                    <FeatureHighlights />
                    <UseCasesSection />
                    <SupportedInputsSection />
                    <SampleOutputSection />
                    <SecurityPrivacySection />
                    <FAQSection />
                </ContentDecor>
            </main>
        </>
    );
}
