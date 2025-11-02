import React from "react";
import SignInForm from "features/login/signInForm";
import Header from "../app/layout/Header";
import Footer from "../app/layout/Footer/Footer";

export default function Login() {
    return (
        <div className="dark flex min-h-screen flex-col bg-slate-950 text-white">
            <Header />

            <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-24 sm:px-6">
                <SignInForm />
            </main>

            <Footer />
        </div>
    );
}
