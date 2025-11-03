import Header from "../../layout/Header";
import Footer from "../../layout/Footer/Footer";

import PageHero from "./sections/PageHero";

import AnchorNav from "./components/AnchorNav";
import ContentDecor from "./components/ContentDecor";
import FeatureHighlights from "./sections/FeatureHighlights";
import HowItWorksSection from "./sections/HowItWorksSection";
import UseCases from "../../../features/main/useCases";
import SupportedInputs from "../../../features/main/supportedInputs";
import SampleOutput from "../../../features/main/sampleOutput";
import SecurityPrivacy from "../../../features/main/securityPrivacy";
import FAQ from "../../../features/main/faq";

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
                    <UseCases />
                    <SupportedInputs />
                    <SampleOutput />
                    <SecurityPrivacy />
                    <FAQ />
                </ContentDecor>
            </main>
            <Footer />
        </>
    );
}
