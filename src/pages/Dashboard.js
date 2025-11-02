import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../app/layout/Header";
import SummaryDashboard from "../features/dashboard/summaryDashboard";
import Footer from "../app/layout/Footer/Footer";
import { useAuth } from "../providers/authProvider";

const Dashboard = () => {
    const navigate = useNavigate();
    const { accessToken, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !accessToken) {
            // Members-only: redirect guests to login (routes will localize)
            navigate('/login');
        }
    }, [isLoading, accessToken, navigate]);

    if (isLoading) return null;

    return (
        <div className="dark">
            <Header />
            <main className="mt-14 min-h-screen bg-[#13213f] text-slate-100 md:mt-20">
                <SummaryDashboard />
                <Footer />
            </main>
        </div>
    );
};

export default Dashboard
