import React from "react";

import Navigation from "../features/navigation/navigation";
import Footer from "../features/footer/footer";
import UserInfo from "../features/profile/components/userInfo";

const Profile = () => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-[-220px] h-[520px] bg-[radial-gradient(circle_at_12%_18%,rgba(99,102,241,0.28),transparent_55%),radial-gradient(circle_at_88%_16%,rgba(56,189,248,0.22),transparent_60%),radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.18),transparent_65%)] opacity-80 blur-3xl" />
      <header className="relative z-10">
        <Navigation variant="dark" />
      </header>

      <main className="relative z-0 flex-1">
        <div className="pointer-events-none absolute inset-x-0 top-[180px] h-[480px] bg-[radial-gradient(circle_at_20%_0%,rgba(236,72,153,0.12),transparent_55%),radial-gradient(circle_at_80%_25%,rgba(59,130,246,0.14),transparent_60%),radial-gradient(circle_at_50%_90%,rgba(14,165,233,0.18),transparent_70%)] opacity-80 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-16">
          <UserInfo />
        </div>
      </main>

      <footer className="relative z-10 bg-transparent">
        <Footer variant="dark" />
      </footer>
    </div>
  );
};

export default Profile;
