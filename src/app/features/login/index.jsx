import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from 'providers/authProvider';

import Header from '../../layout/Header';
import Footer from '../../layout/Footer/Footer';
import SignInForm from './SignInForm';

// Page-level wrapper for the login feature (no prop drilling)
export default function LoginPage() {
  const navigate = useNavigate();
  const { accessToken, isLoading } = useAuth();
  const { lng } = useParams();
  const homePath = lng ? `/${lng}` : '/';

  useEffect(() => {
    // If already logged in, prevent access to login page
    if (!isLoading && accessToken) {
      navigate(homePath, { replace: true });
    }
  }, [isLoading, accessToken, navigate, homePath]);

  if (isLoading) return null;
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-24 sm:px-6">
        <SignInForm />
      </main>
      <Footer />
    </div>
  );
}
