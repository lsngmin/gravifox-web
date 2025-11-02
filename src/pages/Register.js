import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RegisterBox from "../features/register/components/registerBox";
import Header from "../app/layout/Header";
import Footer from "../app/layout/Footer/Footer";

export default function Register() {
  const navigate = useNavigate();
  const navigateToHome = () => navigate("/");

  useEffect(() => {
    try { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); } catch (_) { window.scrollTo(0, 0); }
  }, []);

  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />
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
            <p className="text-xs text-slate-400">이메일과 비밀번호를 입력해 가입을 완료해 주세요.</p>
          </header>
          <RegisterBox variant="mobile-dark" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
