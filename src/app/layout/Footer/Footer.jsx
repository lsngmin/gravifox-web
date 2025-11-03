import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import FooterActions from "./FooterActions/FooterActions";
import FooterNavLinks from "./FooterNavLinks";
import FooterCopyright from "./FooterCopyright";

const Footer = () => {
    const { i18n } = useTranslation();
    const currentLng = useMemo(() => (i18n.language || "en").slice(0, 2), [i18n.language]);

    return (
        <footer className="mx-auto max-w-screen-xl px-4 py-12 text-inherit transition-colors sm:px-6 lg:px-8">
            <FooterActions />
            <FooterNavLinks currentLng={currentLng} />
            <FooterCopyright />
        </footer>
    );
};

export default Footer;
