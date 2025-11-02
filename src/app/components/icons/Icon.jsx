import React from "react";
import {
    Bars3Icon,
    ChevronDownIcon,
    Cog6ToothIcon,
    CreditCardIcon,
    GlobeAltIcon,
    Squares2X2Icon,
    UserIcon,
    XMarkIcon,
    ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";

const ICON_REGISTRY = Object.freeze({
    moon: MoonIcon,
    sun: SunIcon,
    menu: Bars3Icon,
    close: XMarkIcon,
    gear: Cog6ToothIcon,
    settings: Cog6ToothIcon,
    globe: GlobeAltIcon,
    "chevron-down": ChevronDownIcon,
    user: UserIcon,
    "credit-card": CreditCardIcon,
    dashboard: Squares2X2Icon,
    logout: ArrowRightOnRectangleIcon,
});

const Icon = ({ name, ...props }) => {
    const RegisteredIcon = ICON_REGISTRY[name];

    if (!RegisteredIcon) return null;

    return <RegisteredIcon {...props} />;
};

export default Icon;
