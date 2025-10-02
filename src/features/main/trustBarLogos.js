import React from 'react';
import { useTranslation } from 'react-i18next';
import Logo from 'assets/logo.svg';
import LogoVG from 'assets/logovg.svg';

export default function TrustBarLogos() {
  const { t } = useTranslation('home');

  const logos = [
    { src: Logo, alt: t('trust.logos.items.0', 'Acme Inc.') },
    { src: LogoVG, alt: t('trust.logos.items.1', 'Contoso') },
    { src: Logo, alt: t('trust.logos.items.2', 'Globex') },
    { src: LogoVG, alt: t('trust.logos.items.3', 'Umbrella') },
  ];

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:py-12 lg:px-8">
        <h3 className="text-center text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t('trust.logos.title', 'Trusted by teams and partners')}
        </h3>
        <div className="mx-auto mt-6 grid grid-cols-2 gap-8 sm:mt-8 sm:grid-cols-4 lg:gap-10">
          {logos.map((logo, idx) => (
            <div key={idx} className="flex items-center justify-center">
              <img
                src={logo.src}
                alt={logo.alt}
                className="h-8 sm:h-10 w-auto object-contain opacity-70 hover:opacity-90 transition-opacity grayscale"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

