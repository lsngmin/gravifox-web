import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer/Footer';
import AgreementBox from './components/AgreementBox';

export default function AgreePage() {
  const navigate = useNavigate();
  const navigateToHome = () => navigate('/');

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch (_) {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header />
      <main className="flex-1 flex justify-center">
        <div className="w-full px-5 pt-24 pb-16">
          <header className="mb-8 text-center">
            <h2
              onClick={navigateToHome}
              translate="no"
              className="mb-2 cursor-pointer select-none text-[clamp(22px,5vw,36px)] font-extrabold leading-none tracking-tight text-indigo-500 drop-shadow dark:text-indigo-400"
            >
              REKWIEM
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">서비스 이용을 위해 약관에 동의해 주세요.</p>
          </header>
          <AgreementBox />
        </div>
      </main>
      <Footer />
    </div>
  );
}
