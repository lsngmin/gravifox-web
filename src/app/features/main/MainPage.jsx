import Header from "../../layout/Header";
import Footer from "../../layout/Footer/Footer";

import PageHero from "./sections/PageHero";

import AnchorNav from "../../../features/main/anchorNav";
import ContentDecor from "../../../features/main/contentDecor";
import Feature from "../../../features/main/feature";
import HowItWorks from "../../../features/main/howItWorks";
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
                    <HowItWorks />
                    <Feature />
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
