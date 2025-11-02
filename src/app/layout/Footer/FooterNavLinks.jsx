import React from "react";
import { useNavigate } from "react-router-dom";
import Separator from "../../components/common/Separator";

const FooterNavLinks = ({ currentLng }) => {
    const navigate = useNavigate();

    const linkClass =
        "text-sm leading-6 text-inherit transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2";

    const goTo = (path) => {
        const next = path.startsWith("/") ? path : `/${path}`;
        navigate(`/${currentLng}${next}`);
    };

    return (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-inherit">
            <button type="button" onClick={() => goTo("/feature")} className={linkClass}>
                About
            </button>
            <Separator />
            <button type="button" onClick={() => goTo("/support")} className={linkClass}>
                Contact
            </button>
            <Separator />
            <button type="button" onClick={() => goTo("/docs")} className={linkClass}>
                Terms
            </button>
        </div>
    );
};

export default FooterNavLinks;
