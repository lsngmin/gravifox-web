import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer/Footer';
import RegisterBox from './components/RegisterBox';
import { useTranslation } from 'react-i18next';

export default function RegisterPage() {
  const navigate = useNavigate();
  const navigateToHome = () => navigate('/');
  const { t, i18n } = useTranslation('common');
  const { lng } = useParams();

  useEffect(() => {
    try { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); } catch (_) { window.scrollTo(0, 0); }
  }, []);

  // Ensure i18n language matches URL prefix
  useEffect(() => {
    const supported = ['en','ko'];
    const current = (i18n.language || '').slice(0,2);
    const target = supported.includes(lng) ? lng : current;
    if (target && current !== target) {
      i18n.changeLanguage(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lng]);

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
            <p className="text-xs text-slate-600 dark:text-slate-400">{t('registerPage.subtitle', 'Enter your details to create your account.')}</p>
          </header>
          <RegisterBox />
        </div>
      </main>
      <Footer />
    </div>
  );
}
