import React, { useEffect, useState } from "react";

import Header from "../app/layout/Header";
import Footer from "../app/layout/Footer/Footer";
import UserInfo from "../features/profile/components/userInfo";

const Profile = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return window.localStorage.getItem("preferred-theme") || "dark";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("preferred-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncTheme = () => {
      const stored = window.localStorage.getItem("preferred-theme");
      if (stored === "dark" || stored === "light") {
        setTheme(stored);
      }
    };
    window.addEventListener("preferred-theme-change", syncTheme);
    window.addEventListener("focus", syncTheme);
    window.addEventListener("storage", syncTheme);
    return () => {
      window.removeEventListener("preferred-theme-change", syncTheme);
      window.removeEventListener("focus", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  const isDark = theme === "dark";

  return (
    <div
      className={`relative flex min-h-screen flex-col overflow-hidden ${
        isDark ? "dark bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {isDark && (
        <div className="pointer-events-none absolute inset-x-0 top-[-220px] h-[520px] bg-[radial-gradient(circle_at_12%_18%,rgba(99,102,241,0.28),transparent_55%),radial-gradient(circle_at_88%_16%,rgba(56,189,248,0.22),transparent_60%),radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.18),transparent_65%)] opacity-80 blur-3xl" />
      )}
      <header className="relative z-10">
        <Header />
      </header>

      <main className="relative z-0 flex-1 flex justify-center">
        {isDark ? (
          <div className="pointer-events-none absolute inset-x-0 top-[180px] h-[480px] bg-[radial-gradient(circle_at_20%_0%,rgba(236,72,153,0.12),transparent_55%),radial-gradient(circle_at_80%_25%,rgba(59,130,246,0.14),transparent_60%),radial-gradient(circle_at_50%_90%,rgba(14,165,233,0.18),transparent_70%)] opacity-80 blur-3xl" />
        ) : (
          <div className="pointer-events-none absolute inset-x-0 top-[160px] h-[420px] bg-[radial-gradient(circle_at_20%_0%,rgba(147,197,253,0.2),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(167,243,208,0.25),transparent_60%)] opacity-70 blur-[120px]" />
        )}
        <div className="flex w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl flex-col gap-6 px-5 pb-24 pt-16">
          <UserInfo theme={theme} onThemeChange={setTheme} />
        </div>
      </main>

      <footer className={`relative z-10 ${isDark ? "bg-transparent" : "bg-gray-50"}`}>
        <Footer />
      </footer>
    </div>
  );
};

export default Profile;
