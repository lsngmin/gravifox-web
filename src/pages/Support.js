import React, { useMemo, useState } from "react";
import { styled, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Navigation from "../features/navigation/navigation";
import Footer from "../features/footer/footer";
import { useNavigate, useParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import HttpIcon from "@mui/icons-material/Http";
import SecurityIcon from "@mui/icons-material/Security";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import BugReportIcon from "@mui/icons-material/BugReport";
import UpdateIcon from "@mui/icons-material/Update";
import DescriptionIcon from "@mui/icons-material/Description";
import SchoolIcon from "@mui/icons-material/School";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import InsightsIcon from "@mui/icons-material/Insights";

const PageWrapper = styled(Box)(({ theme }) => ({
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
    paddingTop: theme.spacing(18),
    paddingBottom: theme.spacing(10),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
}));

const HeroCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(6),
    borderRadius: 26,
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(128deg, #eef6ff 0%, #f3fff7 100%)",
    border: "1px solid rgba(25,118,210,0.12)",
    boxShadow: "0 24px 48px rgba(15,76,129,0.08)",
    marginTop: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
        padding: theme.spacing(4),
    },
}));

const CategoryCard = styled(Paper, { shouldForwardProp: (prop) => prop !== "active" })(({ theme, active }) => ({
    position: "relative",
    padding: theme.spacing(3.5),
    borderRadius: 24,
    height: "100%",
    border: active ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}` : `1px solid ${alpha("#0f4c81", 0.12)}`,
    background: active
        ? "linear-gradient(135deg, rgba(15,76,129,0.08) 0%, rgba(59,130,246,0.1) 100%)"
        : "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(246,249,255,0.92) 100%)",
    boxShadow: active
        ? "0 24px 48px rgba(15,76,129,0.16)"
        : "0 12px 28px rgba(15,76,129,0.1)",
    transition: "all 0.25s ease",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2.5),
    overflow: "hidden",
    "&::before": {
        content: "''",
        position: "absolute",
        inset: 0,
        background: active
            ? "linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(14,165,233,0.12) 45%, transparent 100%)"
            : "linear-gradient(135deg, rgba(79,70,229,0.08) 0%, transparent 60%)",
        opacity: active ? 1 : 0,
        transition: "opacity 0.3s ease",
        zIndex: 0,
    },
    "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 28px 52px rgba(15,76,129,0.18)",
        borderColor: alpha(theme.palette.primary.main, 0.35),
    },
}));

const QuickActionCard = styled(Paper)(({ theme }) => ({
    position: "relative",
    padding: theme.spacing(3.5),
    borderRadius: 24,
    border: `1px solid ${alpha("#0f4c81", 0.1)}`,
    background: "linear-gradient(130deg, rgba(236,248,255,0.95) 0%, rgba(243,243,255,0.95) 100%)",
    boxShadow: "0 20px 40px rgba(15,76,129,0.12)",
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
        background: "radial-gradient(circle, rgba(56,189,248,0.16), transparent 70%)",
        zIndex: 0,
    },
}));

const ArticleCard = styled(Paper)(({ theme }) => ({
    position: "relative",
    padding: theme.spacing(3.5),
    borderRadius: 24,
    border: `1px solid ${alpha("#0f4c81", 0.12)}`,
    boxShadow: "0 24px 48px rgba(15,76,129,0.12)",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2.5),
    height: "100%",
    background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(241,246,255,0.9) 100%)",
    overflow: "hidden",
    "&::after": {
        content: "''",
        position: "absolute",
        inset: "auto 0 -35% 45%",
        height: "70%",
        background: "radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)",
        zIndex: 0,
    },
}));

const CategoryGrid = styled(Box)(({ theme }) => ({
    display: "grid",
    gap: theme.spacing(3),
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    [theme.breakpoints.down("md")]: {
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    },
    [theme.breakpoints.down("sm")]: {
        gridTemplateColumns: "1fr",
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

const ArticleGrid = styled(Box)(({ theme }) => ({
    display: "grid",
    gap: theme.spacing(3),
    gridTemplateColumns: "1fr",
}));

const UpdatesWrapper = styled(Box)(({ theme }) => ({
    borderRadius: 32,
    padding: theme.spacing(5),
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
    border: `1px solid ${alpha("#93c5fd", 0.18)}`,
    color: "#e2e8f0",
    boxShadow: "0 32px 64px rgba(15, 64, 129, 0.35)",
    position: "relative",
    overflow: "hidden",
    isolation: "isolate",
    "&::before": {
        content: "''",
        position: "absolute",
        inset: "-30%",
        background: "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.35), transparent 60%)",
        zIndex: -1,
    },
    "&::after": {
        content: "''",
        position: "absolute",
        inset: "-40%",
        background: "radial-gradient(circle at 80% 80%, rgba(56,189,248,0.28), transparent 65%)",
        zIndex: -1,
    },
}));

const UpdatesTimeline = styled(Box)(({ theme }) => ({
    position: "relative",
    display: "grid",
    gap: theme.spacing(4),
    marginTop: theme.spacing(4),
    paddingLeft: theme.spacing(6),
    "&::before": {
        content: "''",
        position: "absolute",
        top: theme.spacing(1),
        bottom: theme.spacing(1),
        left: theme.spacing(2),
        width: 2,
        background: "linear-gradient(180deg, rgba(148,163,184,0.45), rgba(148,163,184,0))",
    },
    [theme.breakpoints.down("sm")]: {
        paddingLeft: theme.spacing(4),
        gap: theme.spacing(3),
        "&::before": {
            left: theme.spacing(1.5),
        },
    },
}));

const UpdatesItem = styled(Box)(({ theme }) => ({
    display: "grid",
    gap: theme.spacing(3),
    gridTemplateColumns: "auto 1fr",
    alignItems: "center",
    position: "relative",
    [theme.breakpoints.down("sm")]: {
        gridTemplateColumns: "1fr",
        gap: theme.spacing(2),
    },
}));

const UpdatesIcon = styled(Avatar)(({ theme }) => {
    const base = theme.palette.primary.light || theme.palette.primary.main;
    return {
        width: 56,
        height: 56,
        backgroundColor: alpha(base, 0.18),
        color: base,
        boxShadow: `0 0 0 4px ${alpha(base, 0.12)}`,
    };
});

const SupportCTAWrapper = styled(Paper)(({ theme }) => ({
    position: "relative",
    overflow: "hidden",
    borderRadius: 28,
    padding: theme.spacing(5),
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: theme.spacing(4),
    background: "linear-gradient(135deg, #f2f7ff 0%, #f7fbff 30%, #f5f5ff 100%)",
    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
    boxShadow: "0 28px 56px rgba(15, 76, 129, 0.12)",
    [theme.breakpoints.up("md")]: {
        gridTemplateColumns: "1.2fr 0.8fr",
        alignItems: "center",
    },
    "&::before": {
        content: "''",
        position: "absolute",
        inset: "-40%",
        background: "radial-gradient(circle at 20% 20%, rgba(79, 70, 229, 0.14), transparent 65%)",
        zIndex: 0,
    },
    "&::after": {
        content: "''",
        position: "absolute",
        inset: "-30%",
        background: "radial-gradient(circle at 80% 80%, rgba(14, 165, 233, 0.18), transparent 60%)",
        zIndex: 0,
    },
}));

const SupportCTAContent = styled(Box)(({ theme }) => ({
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2.5),
}));

const SupportCTAAside = styled(Box)(({ theme }) => ({
    position: "relative",
    zIndex: 1,
    background: alpha(theme.palette.primary.main, 0.06),
    borderRadius: 18,
    padding: theme.spacing(3),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
        padding: theme.spacing(2.5),
    },
}));

const categories = [
    {
        id: "getting-started",
        title: "Getting Started",
        description: "Account setup, workspace invites, and first-time configuration.",
        icon: RocketLaunchIcon,
        signal: "Launch-ready in 5 minutes",
        metricLabel: "Playbooks",
        metricValue: "12 curated"
    },
    {
        id: "api",
        title: "API & Integration",
        description: "REST API access, auth tokens, and SDK usage guidelines.",
        icon: HttpIcon,
        signal: "99.99% uptime guides",
        metricLabel: "SDKs",
        metricValue: "6 stacks"
    },
    {
        id: "security",
        title: "Security & Compliance",
        description: "Data handling, audit logs, and compliance documentation.",
        icon: SecurityIcon,
        signal: "Audit-ready workflows",
        metricLabel: "Controls",
        metricValue: "8 frameworks"
    },
    {
        id: "operations",
        title: "Operations",
        description: "Incident response, monitoring, and live content checks.",
        icon: SupportAgentIcon,
        signal: "Live responders online",
        metricLabel: "Runbooks",
        metricValue: "15 scenarios"
    },
];

const articles = [
    {
        id: "workspace-onboarding",
        categoryId: "getting-started",
        title: "Workspace onboarding checklist",
        summary: "Set up your workspace, invite teammates, and align permissions before the first analysis run.",
        tags: ["workspace", "permissions"],
        updatedAt: "2024-05-28",
        readingTime: "6 min read",
        confidence: "Community favourite"
    },
    {
        id: "api-authentication",
        categoryId: "api",
        title: "Authenticate API calls with service tokens",
        summary: "Generate, rotate, and revoke service tokens using the GraviFox dashboard and CLI.",
        tags: ["api", "tokens"],
        updatedAt: "2024-06-05",
        readingTime: "9 min read",
        confidence: "Verified by platform team"
    },
    {
        id: "webhook-reliability",
        categoryId: "operations",
        title: "Designing resilient webhook consumers",
        summary: "Best practices for verifying payload signatures, retrying failures, and monitoring delivery latency.",
        tags: ["webhooks", "monitoring"],
        updatedAt: "2024-05-17",
        readingTime: "7 min read",
        confidence: "Trending response pattern"
    },
    {
        id: "evidence-packaging",
        categoryId: "security",
        title: "Packaging evidence bundles for legal review",
        summary: "Learn how to export immutable case evidence with signature trails for compliance teams.",
        tags: ["compliance", "exports"],
        updatedAt: "2024-04-30",
        readingTime: "5 min read",
        confidence: "Legal-approved checklist"
    },
];

const quickActions = [
    {
        id: "ticket",
        title: "Create Support Ticket",
        description: "Log an issue with triage metadata in under two minutes.",
        icon: SupportAgentIcon,
        path: "issue",
        metricLabel: "Median response",
        metricValue: "18m",
        badge: "Priority bridge"
    },
    {
        id: "status",
        title: "View System Status",
        description: "Check live service health, incidents, and maintenance windows.",
        icon: BugReportIcon,
        external: "https://status.gravifox.com",
        metricLabel: "Realtime polling",
        metricValue: "30s",
        badge: "Powered by observability"
    },
    {
        id: "docs",
        title: "Developer Docs",
        description: "Browse API references, SDK guides, and deployment recipes.",
        icon: SchoolIcon,
        path: "docs",
        metricLabel: "New this week",
        metricValue: "+4",
        badge: "Auto-updated"
    },
];

const updates = [
    {
        id: "release-0620",
        title: "June detector model refresh",
        summary: "Improved GenAI image recall (+3.2%) and added support for AV1 encoded inputs.",
        date: "2024-06-20",
    },
    {
        id: "playbook-incident",
        title: "Incident postmortem template",
        summary: "Download the latest template to streamline cross-team retrospective write-ups.",
        date: "2024-06-11",
    },
];

const formatDate = (value) => {
    try {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }
        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch (err) {
        return value;
    }
};

const Support = () => {
    const navigate = useNavigate();
    const { lng = "en" } = useParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    const filteredArticles = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return articles.filter((article) => {
            const matchesCategory = activeCategory === "all" || article.categoryId === activeCategory;
            if (!matchesCategory) {
                return false;
            }
            if (!term) {
                return true;
            }
            const haystack = [article.title, article.summary, article.tags.join(" ")]
                .join(" ")
                .toLowerCase();
            return haystack.includes(term);
        });
    }, [activeCategory, searchTerm]);

    return (
        <>
            <Box sx={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1200 }}>
                <Navigation />
            </Box>

            <PageWrapper component="main">
                <HeroCard>
                    <Box sx={{ maxWidth: 580, display: "flex", flexDirection: "column", gap: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#0b4c81" }}>
                            Self Help Hub
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 800, color: "#0f2137", lineHeight: 1.2 }}>
                            Find answers, implementation guides, and live status updates in one place.
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#2a3a4d", lineHeight: 1.6 }}>
                            Search the knowledge base or explore curated playbooks to unblock your investigation and keep your workflows resilient.
                        </Typography>
                        <TextField
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search articles, playbooks, or topics"
                            variant="outlined"
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="primary" />
                                    </InputAdornment>
                                ),
                                sx: {
                                    backgroundColor: "#ffffff",
                                    borderRadius: 3,
                                },
                            }}
                        />
                    </Box>
                </HeroCard>

                <Box sx={{ mt: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                    <section>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                Browse by category
                            </Typography>
                            <Button
                                size="small"
                                onClick={() => setActiveCategory("all")}
                                disabled={activeCategory === "all"}
                            >
                                Clear filter
                            </Button>
                        </Box>
                        <CategoryGrid>
                            {categories.map((category) => {
                                const Icon = category.icon;
                                const isActive = activeCategory === category.id;
                                return (
                                    <CategoryCard
                                        key={category.id}
                                        role="button"
                                        active={isActive}
                                        onClick={() => setActiveCategory(isActive ? "all" : category.id)}
                                    >
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ position: "relative", zIndex: 1 }}>
                                            <Avatar sx={{ bgcolor: "rgba(15,76,129,0.12)", width: 52, height: 52 }}>
                                                <Icon sx={{ color: "#0f4c81" }} />
                                            </Avatar>
                                            <Stack spacing={0.5}>
                                                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                                    {category.title}
                                                </Typography>
                                                <Chip
                                                    label={category.signal}
                                                    size="small"
                                                    icon={<AutoAwesomeIcon fontSize="inherit" />}
                                                    sx={{
                                                        alignSelf: "flex-start",
                                                        bgcolor: "rgba(59,130,246,0.12)",
                                                        borderRadius: 9999,
                                                        fontWeight: 600,
                                                        color: "#0f4c81",
                                                        '& .MuiChip-icon': { color: "#3b82f6" },
                                                    }}
                                                />
                                            </Stack>
                                        </Stack>
                                        <Typography variant="body2" sx={{ color: "#2a3a4d", lineHeight: 1.7, position: "relative", zIndex: 1 }}>
                                            {category.description}
                                        </Typography>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: "auto", position: "relative", zIndex: 1 }}>
                                            <Stack spacing={0.5}>
                                                <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: 1.3, color: "rgba(15,76,129,0.66)", fontWeight: 700 }}>
                                                    {category.metricLabel}
                                                </Typography>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f2137" }}>
                                                    {category.metricValue}
                                                </Typography>
                                            </Stack>
                                            <Chip
                                                label={isActive ? "Selected" : "Preview"}
                                                size="small"
                                                variant={isActive ? "filled" : "outlined"}
                                                sx={{
                                                    bgcolor: isActive ? "#0f4c81" : "transparent",
                                                    color: isActive ? "#fff" : "#0f4c81",
                                                    borderColor: "rgba(15,76,129,0.2)",
                                                }}
                                            />
                                        </Stack>
                                    </CategoryCard>
                                );
                            })}
                        </CategoryGrid>
                    </section>

                    <section>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                            Quick actions
                        </Typography>
                        <QuickActionGrid>
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                const handleNavigate = () => {
                                    if (action.external) {
                                        window.open(action.external, "_blank", "noopener");
                                        return;
                                    }
                                    navigate(`/${lng}/${action.path}`);
                                };
                                return (
                                    <QuickActionCard key={action.id}>
                                        <Stack spacing={2} sx={{ position: "relative", zIndex: 1 }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Avatar sx={{ bgcolor: "rgba(15,76,129,0.12)", color: "#0f4c81" }}>
                                                    <Icon />
                                                </Avatar>
                                                <Chip
                                                    label={action.badge}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ borderColor: "rgba(15,76,129,0.2)", color: "#0f4c81", fontWeight: 600 }}
                                                />
                                            </Stack>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f2137" }}>
                                                    {action.title}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: "#2f3f55", lineHeight: 1.6, mt: 0.5 }}>
                                                    {action.description}
                                                </Typography>
                                            </Box>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Stack spacing={0.5}>
                                                    <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: 1.2, color: "rgba(15,76,129,0.66)", fontWeight: 700 }}>
                                                        {action.metricLabel}
                                                    </Typography>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f2137" }}>
                                                        {action.metricValue}
                                                    </Typography>
                                                </Stack>
                                                <Button
                                                    variant="contained"
                                                    onClick={handleNavigate}
                                                    endIcon={<ArrowOutwardIcon />}
                                                    sx={{
                                                        px: 2.5,
                                                        bgcolor: "#0f4c81",
                                                        fontWeight: 600,
                                                        '&:hover': { bgcolor: "#163a7b" },
                                                    }}
                                                >
                                                    Open
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </QuickActionCard>
                                );
                            })}
                        </QuickActionGrid>
                    </section>

                    <section>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                Knowledge base highlights
                            </Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <DescriptionIcon color="primary" />
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    {filteredArticles.length} article{filteredArticles.length === 1 ? "" : "s"} match your filters
                                </Typography>
                            </Stack>
                        </Box>

                        <ArticleGrid>
                            {filteredArticles.length === 0 ? (
                                <ArticleCard>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        No articles found yet
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        Try adjusting your search or browsing another category. We are continuously publishing new guidance based on customer feedback.
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        sx={{ alignSelf: "flex-start" }}
                                        onClick={() => {
                                            setSearchTerm("");
                                            setActiveCategory("all");
                                        }}
                                    >
                                        Reset filters
                                    </Button>
                                </ArticleCard>
                            ) : (
                                filteredArticles.map((article) => (
                                    <ArticleCard key={article.id}>
                                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ position: "relative", zIndex: 1 }}>
                                            <Chip label={formatDate(article.updatedAt)} size="small" color="primary" variant="outlined" />
                                            <Typography variant="body2" sx={{ color: "rgba(15,76,129,0.66)" }}>
                                                Updated
                                            </Typography>
                                            <Chip
                                                label={article.readingTime}
                                                size="small"
                                                variant="outlined"
                                                icon={<InsightsIcon fontSize="inherit" />}
                                                sx={{ borderColor: "rgba(15,76,129,0.2)", color: "#0f4c81", '& .MuiChip-icon': { color: "#0f4c81" } }}
                                            />
                                        </Stack>
                                        <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f2137", position: "relative", zIndex: 1 }}>
                                            {article.title}
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: "#2f3f55", position: "relative", zIndex: 1 }}>
                                            {article.summary}
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ position: "relative", zIndex: 1 }}>
                                            {article.tags.map((tag) => (
                                                <Chip key={tag} label={`#${tag}`} size="small" sx={{ bgcolor: "rgba(15,76,129,0.08)", color: "#0f4c81" }} />
                                            ))}
                                        </Stack>
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ position: "relative", zIndex: 1 }}>
                                            <Chip
                                                label={article.confidence}
                                                size="small"
                                                sx={{ bgcolor: "rgba(59,130,246,0.12)", color: "#0f4c81", fontWeight: 600 }}
                                            />
                                            <Button
                                                variant="text"
                                                endIcon={<DescriptionIcon />}
                                                sx={{ alignSelf: "flex-start", fontWeight: 600, whiteSpace: "nowrap" }}
                                            >
                                                Read article
                                            </Button>
                                        </Stack>
                                    </ArticleCard>
                                ))
                            )}
                        </ArticleGrid>
                    </section>

                    <section>
                        <UpdatesWrapper>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#f8fafc" }}>
                                Updates & playbooks
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1.5, maxWidth: 520, color: "rgba(226,232,240,0.78)" }}>
                                Follow the latest model refreshes, incident templates, and operational guidance curated by the GraviFox trust & safety team.
                            </Typography>
                            <UpdatesTimeline>
                                {updates.map((item) => (
                                    <UpdatesItem key={item.id}>
                                        <UpdatesIcon>
                                            <UpdateIcon />
                                        </UpdatesIcon>
                                        <Stack spacing={1.2}>
                                            <Typography variant="overline" sx={{ letterSpacing: 1.3, color: "rgba(226,232,240,0.65)" }}>
                                                {formatDate(item.date)}
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: "#f8fafc" }}>
                                                {item.title}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: "rgba(226,232,240,0.82)", lineHeight: 1.6 }}>
                                                {item.summary}
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                sx={{
                                                    alignSelf: "flex-start",
                                                    backgroundColor: "rgba(148, 163, 184, 0.22)",
                                                    color: "#f8fafc",
                                                    textTransform: "none",
                                                    px: 2.5,
                                                    '&:hover': {
                                                        backgroundColor: "rgba(148, 163, 184, 0.32)",
                                                    },
                                                }}
                                            >
                                                View details
                                            </Button>
                                        </Stack>
                                    </UpdatesItem>
                                ))}
                            </UpdatesTimeline>
                        </UpdatesWrapper>
                    </section>

                    <section>
                        <SupportCTAWrapper elevation={0}>
                            <SupportCTAContent>
                                <Stack direction="row" spacing={1.5} flexWrap="wrap">
                                    <Chip label="24/7 priority" size="small" color="primary" variant="outlined" sx={{ bgcolor: "rgba(59,130,246,0.08)", borderColor: "transparent" }} />
                                    <Chip label="Avg. first response &lt; 20m" size="small" variant="outlined" sx={{ borderColor: "rgba(15,76,129,0.16)", color: "#0f4c81" }} />
                                </Stack>
                                <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f2137", lineHeight: 1.1 }}>
                                    Still need help?
                                </Typography>
                                <Typography variant="body1" sx={{ color: "#24364c", maxWidth: 540, lineHeight: 1.7 }}>
                                    Our incident desk pairs human analysts with automation so you can stabilise investigations fast. Share analysis IDs and the urgency signals you have — we’ll triage in minutes.
                                </Typography>
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        endIcon={<ArrowOutwardIcon />}
                                        onClick={() => navigate(`/${lng}/issue`)}
                                        sx={{
                                            px: 3,
                                            py: 1.2,
                                            fontWeight: 700,
                                            boxShadow: "0 16px 32px rgba(15, 76, 129, 0.18)",
                                        }}
                                    >
                                        Submit a priority ticket
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        startIcon={<ForwardToInboxIcon />}
                                        component="a"
                                        href="mailto:support@gravifox.com"
                                        sx={{
                                            px: 3,
                                            py: 1.2,
                                            fontWeight: 600,
                                            borderColor: "rgba(15,76,129,0.24)",
                                            color: "#0f4c81",
                                        }}
                                    >
                                        Email the response team
                                    </Button>
                                </Stack>
                            </SupportCTAContent>
                            <SupportCTAAside>
                                <Stack spacing={1}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0f4c81", textTransform: "uppercase", letterSpacing: 1.2 }}>
                                        Preferred context
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#1f2a3d", lineHeight: 1.6 }}>
                                        • Relevant media or analysis IDs<br />
                                        • Impacted product areas<br />
                                        • Severity &amp; deadlines
                                    </Typography>
                                </Stack>
                                <Box sx={{ height: "2px", bgcolor: "rgba(15,76,129,0.08)", borderRadius: 9999 }} />
                                <Stack spacing={1}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0f4c81", textTransform: "uppercase", letterSpacing: 1.2 }}>
                                        Escalation matrix
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#1f2a3d", lineHeight: 1.6 }}>
                                        Critical incidents page our on-call responder instantly. You’ll receive a Slack bridge invitation when synchronous triage is needed.
                                    </Typography>
                                </Stack>
                            </SupportCTAAside>
                        </SupportCTAWrapper>
                    </section>
                </Box>
            </PageWrapper>
            <Box component="footer" sx={{ mt: 8 }}>
                <Footer />
            </Box>
        </>
    );
};

export default Support;
