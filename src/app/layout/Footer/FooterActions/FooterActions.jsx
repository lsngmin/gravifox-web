import React from "react";
import FooterLanguageButton from "./FooterLanguageButton";
import FooterThemeButton from "./FooterThemeButton";
import Separator from "../../../components/common/Separator";

const FooterActions = () => {
    return (
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 text-sm text-inherit">
            <div className="flex flex-wrap items-center justify-center gap-2">
                <FooterLanguageButton />
            </div>
            <Separator />
            <div className="flex flex-wrap items-center justify-center gap-2">
                <FooterThemeButton />
            </div>
        </div>
    );
};

export default FooterActions;
