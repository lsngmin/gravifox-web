import React, { useEffect, useMemo, useState } from "react";
import { styled, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Header from "../app/layout/Header";
import Footer from "../app/layout/Footer/Footer";
import { useNavigate, useParams } from "react-router-dom";
import BugReportModal from "features/issues/components/BugReportModal";
import FeatureRequestModal from "features/issues/components/FeatureRequestModal";
import ContactSupportModal from "features/issues/components/ContactSupportModal";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import BugReportIcon from "@mui/icons-material/BugReport";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import InsightsIcon from "@mui/icons-material/Insights";
import { useTranslation } from "react-i18next";

const PageWrapper = styled(Box)(({ theme }) => ({
    width: "100%",
    // Narrow, centered column like ko/analyze (24rem → 42rem)
    maxWidth: "24rem", // 384px
    [theme.breakpoints.up('md')]: { maxWidth: "28rem" }, // 448px
    [theme.breakpoints.up('lg')]: { maxWidth: "32rem" }, // 512px
    '@media (min-width:1280px)': { maxWidth: "36rem" }, // 576px (Tailwind xl)
    '@media (min-width:1536px)': { maxWidth: "42rem" }, // 672px (Tailwind 2xl)
    margin: "0 auto",
    paddingTop: theme.spacing(9),
    paddingBottom: theme.spacing(10),
    paddingLeft: theme.spacing(2.5), // ~20px (Tailwind px-5)
    paddingRight: theme.spacing(2.5),
}));

const HeroCard = styled(Paper, { shouldForwardProp: (prop) => prop !== "$isDark" })(({ theme, $isDark }) => ({
    padding: theme.spacing(6),
    borderRadius: 26,
    position: "relative",
    overflow: "hidden",
    background: $isDark
        ? "linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.92) 100%)"
        : "linear-gradient(128deg, #eef6ff 0%, #f3fff7 100%)",
    border: $isDark ? "1px solid rgba(148,163,184,0.25)" : "1px solid rgba(25,118,210,0.12)",
    boxShadow: $isDark ? "0 32px 60px rgba(6,18,36,0.55)" : "0 24px 48px rgba(15,76,129,0.08)",
    marginTop: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
        padding: theme.spacing(4),
    },
}));

const QuickActionCard = styled(Paper, { shouldForwardProp: (prop) => prop !== "$isDark" })(({ theme, $isDark }) => ({
    position: "relative",
    padding: theme.spacing(2.75),
    borderRadius: 24,
    border: $isDark ? `1px solid ${alpha("#93c5fd", 0.25)}` : `1px solid ${alpha("#0f4c81", 0.1)}`,
    background: $isDark
        ? "linear-gradient(135deg, rgba(30,41,59,0.94) 0%, rgba(15,23,42,0.92) 100%)"
        : "linear-gradient(130deg, rgba(236,248,255,0.95) 0%, rgba(243,243,255,0.95) 100%)",
    boxShadow: $isDark ? "0 24px 44px rgba(7,16,33,0.55)" : "0 20px 40px rgba(15,76,129,0.12)",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: theme.spacing(2.5),
    height: "100%",
    overflow: "hidden",
    "&::after": {
        content: "''",
        position: "absolute",
        inset: "55% -40% -35% 55%",
        background: $isDark
            ? "radial-gradient(circle, rgba(59,130,246,0.25), transparent 70%)"
            : "radial-gradient(circle, rgba(56,189,248,0.16), transparent 70%)",
        zIndex: 0,
    },
}));

const QuickActionGrid = styled(Box)(({ theme }) => ({
    display: "grid",
    gap: theme.spacing(3),
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    [theme.breakpoints.down("sm")]: {
        gridTemplateColumns: "1fr",
    },
}));

const ArticleCard = styled(Paper, { shouldForwardProp: (prop) => prop !== "$isDark" })(({ theme, $isDark }) => ({
    position: "relative",
    padding: theme.spacing(3.5),
    borderRadius: 24,
    border: $isDark ? `1px solid ${alpha("#93c5fd", 0.2)}` : `1px solid ${alpha("#0f4c81", 0.12)}`,
    boxShadow: $isDark ? "0 22px 44px rgba(7,16,33,0.55)" : "0 24px 48px rgba(15,76,129,0.12)",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    background: $isDark
        ? "linear-gradient(135deg, rgba(30,41,59,0.96) 0%, rgba(15,23,42,0.92) 100%)"
        : "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(241,246,255,0.9) 100%)",
}));

const ArticleGrid = styled(Box)(({ theme }) => ({
    display: "grid",
    gap: theme.spacing(3),
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
}));

const OPTION_ICON_MAP = {
    "bug-report": BugReportIcon,
    "feature-request": AutoAwesomeIcon,
    contact: SupportAgentIcon,
    faq: InsightsIcon,
};

const OPTION_ACTION_MAP = {
    "bug-report": { type: "modal", modal: "bug-report" },
    "feature-request": { type: "modal", modal: "feature-request" },
    contact: { type: "modal", modal: "contact-support" },
    faq: { type: "anchor", anchor: "support-faq" },
};

const resolvePreferredTheme = () => {
    if (typeof window === "undefined") return "light";
    try {
        return (
            window.sessionStorage?.getItem("preferred-theme") ||
            window.localStorage?.getItem("preferred-theme") ||
            "light"
        );
    } catch {
        return "light";
    }
};

const Support = () => {
    const navigate = useNavigate();
    const { lng = "en" } = useParams();
    const { t, i18n } = useTranslation("support");
    const [themeMode, setThemeMode] = useState(() => resolvePreferredTheme());
    const [bugModalOpen, setBugModalOpen] = useState(false);
    const [featureModalOpen, setFeatureModalOpen] = useState(false);
    const [contactModalOpen, setContactModalOpen] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const refreshTheme = () => {
            setThemeMode(resolvePreferredTheme());
        };
        refreshTheme();
        const onStorage = (event) => {
            if (event.storageArea === window.localStorage && event.key === "preferred-theme") {
                refreshTheme();
            }
        };
        const onFocus = () => refreshTheme();
        window.addEventListener("storage", onStorage);
        window.addEventListener("focus", onFocus);
        window.addEventListener("preferred-theme-change", refreshTheme);
        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("preferred-theme-change", refreshTheme);
        };
    }, []);

    const isDark = themeMode === "dark";

    const palette = useMemo(
        () => ({
            pageBg: isDark ? "#070d1f" : "#f8fafc",
            textPrimary: isDark ? "#e2e8f0" : "#0f172a",
            heroEyebrow: isDark ? "#93c5fd" : "#0b4c81",
            heroTitle: isDark ? "#f8fafc" : "#0f2137",
            heroBody: isDark ? "rgba(226,232,240,0.78)" : "#2a3a4d",
            optionsIntro: isDark ? "rgba(226,232,240,0.65)" : "#4b5563",
            cardTitle: isDark ? "#f8fafc" : "#0f2137",
            cardBody: isDark ? "rgba(226,232,240,0.78)" : "#2f3f55",
            iconBg: isDark ? "rgba(148,163,184,0.2)" : "rgba(15,76,129,0.12)",
            iconColor: isDark ? "#bfdbfe" : "#0f4c81",
            buttonBg: isDark ? "rgba(59,130,246,0.9)" : "#0f4c81",
            buttonHover: isDark ? "rgba(37,99,235,0.95)" : "#163a7b",
            faqBody: isDark ? "rgba(226,232,240,0.78)" : "#2f3f55",
        }),
        [isDark]
    );

    const hero = useMemo(() => {
        const data = t("hero", { returnObjects: true });
        return data && typeof data === "object" ? data : {};
    }, [t, i18n.language]);

    const rawOptions = useMemo(() => {
        const data = t("options", { returnObjects: true });
        return Array.isArray(data) ? data : [];
    }, [t, i18n.language]);

    const supportOptions = useMemo(
        () =>
            rawOptions
                .map((option) => {
                    const icon = OPTION_ICON_MAP[option.id] ?? SupportAgentIcon;
                    const action = OPTION_ACTION_MAP[option.id] ?? null;
                    return {
                        id: option.id,
                        title: option.title ?? "",
                        description: option.description ?? "",
                        buttonLabel: option.buttonLabel ?? "",
                        icon,
                        action,
                    };
                })
                .filter((option) => option.action),
        [rawOptions]
    );

    const faqData = useMemo(() => {
        const data = t("faq", { returnObjects: true });
        return data && typeof data === "object" ? data : {};
    }, [t, i18n.language]);

    const faqItems = Array.isArray(faqData.items) ? faqData.items : [];
    const optionsHeading = t("optionsHeading");
    const optionsIntro = t("optionsIntro");
    const faqHeading = faqData.heading ?? "";
    const faqIntro = faqData.intro ?? "";

    const handleOptionClick = (option) => {
        const action = option?.action;
        if (!action) return;

        switch (action.type) {
            case "navigate":
                navigate(`/${lng}/${action.path}`);
                break;
            case "modal":
                if (action.modal === "bug-report") {
                    setBugModalOpen(true);
                } else if (action.modal === "feature-request") {
                    setFeatureModalOpen(true);
                } else if (action.modal === "contact-support") {
                    setContactModalOpen(true);
                }
                break;
            case "mailto": {
                if (typeof window === "undefined") return;
                const subject = action.subject ? `?subject=${encodeURIComponent(action.subject)}` : "";
                window.location.href = `mailto:${action.email}${subject}`;
                break;
            }
            case "anchor": {
                if (typeof window === "undefined") return;
                const target = document.getElementById(action.anchor);
                target?.scrollIntoView({ behavior: "smooth", block: "start" });
                break;
            }
            case "external":
                if (typeof window === "undefined") return;
                window.open(action.href, "_blank", "noopener");
                break;
            default:
                break;
        }
    };

    return (
        <Box
            className={isDark ? "dark" : ""}
            sx={{
                minHeight: "100vh",
                backgroundColor: palette.pageBg,
                color: palette.textPrimary,
                transition: "background-color 0.3s ease, color 0.3s ease",
            }}
        >
            <Box sx={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1200 }}>
                <Header />
            </Box>

            <PageWrapper component="main">
                <HeroCard $isDark={isDark}>
                    <Box sx={{ maxWidth: 580, display: "flex", flexDirection: "column", gap: 2.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: palette.heroEyebrow }}>
                            {hero.eyebrow || ""}
                        </Typography>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 800,
                                color: palette.heroTitle,
                                lineHeight: { xs: 1.22, sm: 1.2 },
                                fontSize: { xs: "1.65rem", sm: "2.25rem", md: "2.55rem" },
                            }}
                        >
                            {hero.title || ""}
                        </Typography>
                        <Typography variant="body1" sx={{ color: palette.heroBody, lineHeight: 1.6 }}>
                            {hero.body || ""}
                        </Typography>
                    </Box>
                </HeroCard>

                <Box sx={{ mt: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                    <section>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mb: 3 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: palette.cardTitle }}>
                                {optionsHeading}
                            </Typography>
                            <Typography variant="body2" sx={{ color: palette.optionsIntro }}>
                                {optionsIntro}
                            </Typography>
                        </Stack>
                        <QuickActionGrid>
                            {supportOptions.map((option) => {
                                const Icon = option.icon;
                                return (
                                    <QuickActionCard key={option.id} $isDark={isDark} elevation={0}>
                                        <Stack spacing={1.2} sx={{ position: "relative", zIndex: 1 }}>
                                            <Box sx={{ display: "flex" }}>
                                                <Avatar sx={{ bgcolor: palette.iconBg, color: palette.iconColor, width: 44, height: 44 }}>
                                                    <Icon />
                                                </Avatar>
                                            </Box>
                                            <Box>
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{ fontWeight: 800, color: palette.cardTitle, fontSize: { xs: "1.2rem", sm: "1rem" } }}
                                                >
                                                    {option.title}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: palette.cardBody, lineHeight: 1.6, mt: 0.35 }}>
                                                    {option.description}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleOptionClick(option)}
                                                    endIcon={<ArrowOutwardIcon />}
                                                    sx={{
                                                        mt: 1,
                                                        px: 1.5,
                                                        bgcolor: palette.buttonBg,
                                                        fontWeight: 600,
                                                        "&:hover": { bgcolor: palette.buttonHover },
                                                    }}
                                                >
                                                    {option.buttonLabel}
                                                </Button>
                                            </Box>
                                        </Stack>
                                    </QuickActionCard>
                                );
                            })}
                        </QuickActionGrid>
                    </section>

                    <section id="support-faq">
                        <Stack spacing={1.5} sx={{ mb: 3 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: palette.cardTitle }}>
                                {faqHeading}
                            </Typography>
                            <Typography variant="body2" sx={{ color: palette.optionsIntro }}>
                                {faqIntro}
                            </Typography>
                        </Stack>
                        <ArticleGrid>
                            {faqItems.map((item) => (
                                <ArticleCard key={item.question} $isDark={isDark} elevation={0}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: palette.cardTitle }}>
                                        {item.question}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: palette.faqBody, lineHeight: 1.7 }}>
                                        {item.answer}
                                    </Typography>
                                </ArticleCard>
                            ))}
                        </ArticleGrid>
                    </section>

                </Box>
            </PageWrapper>
            <Box component="footer" sx={{ mt: 8 }}>
                <Footer />
            </Box>
            <BugReportModal open={bugModalOpen} onClose={() => setBugModalOpen(false)} theme={isDark ? "dark" : "light"} />
            <FeatureRequestModal open={featureModalOpen} onClose={() => setFeatureModalOpen(false)} theme={isDark ? "dark" : "light"} />
            <ContactSupportModal open={contactModalOpen} onClose={() => setContactModalOpen(false)} theme={isDark ? "dark" : "light"} />
        </Box>
    );
};

export default Support;
