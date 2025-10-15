import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from "../features/navigation/navigation";
import SummaryDashboard from "../features/dashboard/summaryDashboard";
import Footer from "../features/footer/footer";
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
        <>
            <Navigation variant="dark" />
            <main className="mt-14 min-h-screen bg-slate-950 text-slate-100 md:mt-20">
                <SummaryDashboard />
                <Footer variant="dark" showLinks={false} inline />
            </main>
        </>
    );
};

export default Dashboard
