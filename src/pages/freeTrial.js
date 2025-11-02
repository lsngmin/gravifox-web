import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import {useAuth} from "providers/authProvider";
import {UploadProvider} from "features/freeTrial/provider/uploadProvider";

import AnalyzeProcess from "features/freeTrial/analyzeProcess";

import Header from "../app/layout/Header";

const FreeTrial = () => {
    const navigate = useNavigate();
    const {accessToken, isLoading} = useAuth();



    useEffect(() => {
        if (!isLoading && !accessToken) {
            navigate("/login");
        }
    }, [isLoading, accessToken, navigate]);

    if (isLoading) return <div>로딩 중...</div>;

    return (
        <UploadProvider>
            {/*<Banner/>*/}
            <Header />

            <AnalyzeProcess/>

            {/*<Stepper/>*/}
        </UploadProvider>
    );
};
export default FreeTrial;
