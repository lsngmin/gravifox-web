import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Main from "pages/main";
import Login from "pages/login";
import FreeTrial from "pages/freeTrial";
import Issues from "pages/Issues";
import CustomErrorPage from "pages/CustomErrorPage";
import Docs from "pages/Docs";
import Profile from "../pages/Profile";
import Dashboard from "../pages/Dashboard";
import Pricing from "pages/Pricing";
import Agree from "pages/Agree";
import Register from "../pages/Register";
import Support from "pages/Support";
import MediaAnalyze from "pages/MediaAnalyze";
import EmailVerification from "pages/EmailVerification";

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route
                    path="/"
                    element={
                        <motion.div
                            // initial={{ opacity: 0, y: 20 }}
                            // animate={{ opacity: 1, y: 0 }}
                            // exit={{ opacity: 0, y: -20 }}
                            // transition={{ duration: 0.3 }}
                        >
                            <Main />
                        </motion.div>
                    }
                />
                <Route
                    path="/login"
                    element={
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Login />
                        </motion.div>
                    }
                />
                <Route
                    path='/free-trial'
                    element={
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <FreeTrial />
                        </motion.div>
                    }
                    />
                <Route
                    path='/profile'
                    element={
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            <Profile />
                        </motion.div>
                    }
                />
                <Route
                    path='/dashboard'
                    element={
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            <Dashboard />
                        </motion.div>
                    }
                />
                    <Route
                        path="/issue"
                        element={
                            <motion.div
                                // initial={{ opacity: 0, y: 20 }}
                                // animate={{ opacity: 1, y: 0 }}
                                // exit={{ opacity: 0, y: -20 }}
                                // transition={{ duration: 0.3 }}
                            >
                                <Issues />
                            </motion.div>
                        }
                    />
                <Route
                    path="/docs"
                    element={
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Docs />
                        </motion.div>
                    }
                />
                <Route
                    path="/agree"
                    element={
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Agree />
                        </motion.div>
                    }
                />
                <Route
                    path="/register"
                    element={

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Register />
                        </motion.div>
                    }
                />

                <Route
                    path="/verify"
                    element={
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <EmailVerification />
                        </motion.div>
                    }
                />

                <Route
                    path="/analyze"
                    element={
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <MediaAnalyze />
                        </motion.div>
                    }
                />

                <Route
                    path="/*"
                    element={
                        <motion.div
                            // initial={{ opacity: 0, y: 20 }}
                            // animate={{ opacity: 1, y: 0 }}
                            // exit={{ opacity: 0, y: -20 }}
                            // transition={{ duration: 0.3 }}
                        >
                            <CustomErrorPage status={"404"} />
                        </motion.div>
                    }
                />
                <Route path="/pricing" element={
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Pricing />
                    </motion.div>
                } />
                <Route
                    path="/support"
                    element={
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Support />
                        </motion.div>
                    }
                />
            </Routes>
        </AnimatePresence>
    );
}

export default AnimatedRoutes;
