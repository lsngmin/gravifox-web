import React from "react";
import SignInForm from "features/login/signInForm";
import Navigation from "features/navigation/navigation";
import Footer from "../features/footer/footer";

export default function Login() {
    return (
        <div className="flex min-h-screen flex-col bg-slate-950 text-white">
            <Navigation variant="dark" />

            <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-24 sm:px-6">
                <SignInForm />
            </main>

            <Footer transparent variant="dark" showLinks={false} inline />
        </div>
    );
}
