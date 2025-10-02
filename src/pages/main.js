import React from "react";

import Navigation from "../features/navigation/navigation";
import Footer from "../features/footer/footer";
import Banner from "../features/banner/banner";
import PageSection from "features/main/pageSection";
import Feature from "features/main/feature";
import HowItWorks from "features/main/howItWorks";
import ValueProps from "features/main/valueProps";
import SupportedInputs from "features/main/supportedInputs";
import SampleOutput from "features/main/sampleOutput";
import SecurityPrivacy from "features/main/securityPrivacy";
import FAQ from "features/main/faq";
import Testimonials from "features/main/testimonials";
import AnchorNav from "features/main/anchorNav";
import UseCases from "features/main/useCases";
import ContentDecor from "features/main/contentDecor";


const Main = () => {
    return (<>
            <Navigation/>
            <PageSection/>
            <AnchorNav/>
            <ContentDecor>
                <HowItWorks/>
                <ValueProps/>
                <Feature/>
                <UseCases/>
                <SupportedInputs/>
                <SampleOutput/>
                <SecurityPrivacy/>
                <FAQ/>
                <Testimonials/>
                {/* Removed MainText per request */}
                <Footer transparent />
            </ContentDecor>
            {/* BottomDecor not needed; gradient now extends to the footer */}
        </>
    );
};

export default Main;
