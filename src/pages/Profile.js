import React from "react";

import Navigation from "../features/navigation/navigation";
import Footer from "../features/footer/footer";
import UserInfo from "../features/profile/components/userInfo";

const Profile = () => {


    return (
        <div className="flex flex-col min-h-screen">
            <header>
                <Navigation />
            </header>

            <main className="flex-1 bg-gray-50">
                <div className="max-w-6xl mx-auto py-10 px-6">
                    <UserInfo />
                </div>
            </main>

            <footer className="flex-1 bg-gray-50">
                <Footer />
            </footer>
        </div>
    );
};

export default Profile;
