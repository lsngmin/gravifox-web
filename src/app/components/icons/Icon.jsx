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
    ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import {
    MessageSquare,
    Sparkles,
    Upload,
    ScanSearch,
    CheckCircle2,
    Mail,
    Map,
} from "lucide-react";

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
    login: ArrowLeftOnRectangleIcon,
    "arrow-outward": ArrowOutwardIcon,
    sparkles: Sparkles,
    "message-square": MessageSquare,
    upload: Upload,
    "scan-search": ScanSearch,
    "check-circle": CheckCircle2,
    mail: Mail,
    map: Map,
});

const Icon = ({ name, ...props }) => {
    const RegisteredIcon = ICON_REGISTRY[name];

    if (!RegisteredIcon) return null;

    return <RegisteredIcon {...props} />;
};

export default Icon;
