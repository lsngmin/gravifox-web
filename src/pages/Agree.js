import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AgreementBox from "../features/register/components/agreementBox";
import Navigation from "../features/navigation/navigation";
import Footer from "../features/footer/footer";

export default function Agree() {
  const navigate = useNavigate();
  const navigateToHome = () => navigate("/");

  // Ensure page starts at the very top on load
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch (_) {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navigation variant="dark" />
      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-sm px-5 pt-24 pb-16">
          <header className="text-center mb-6">
            <h2
              onClick={navigateToHome}
              translate="no"
              className="cursor-pointer select-none text-[clamp(22px,5vw,36px)] font-extrabold tracking-tight leading-none text-indigo-400 drop-shadow mb-2"
            >
              GRAVIFOX.
            </h2>
            <p className="text-xs text-slate-400">서비스 이용을 위해 약관에 동의해 주세요.</p>
          </header>
          <AgreementBox variant="mobile-dark" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
