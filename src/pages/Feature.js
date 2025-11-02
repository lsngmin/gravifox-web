import React from 'react';
import Header from '../app/layout/Header';
import HeroSection from '../features/feature/components/HeroSection';
import MetricsHighlights from '../features/feature/components/MetricsHighlights';
import PillarsSection from '../features/feature/components/PillarsSection';
import WorkflowSection from '../features/feature/components/WorkflowSection';
import IntegrationShowcase from '../features/feature/components/IntegrationShowcase';
import CtaBanner from '../features/feature/components/CtaBanner';

const Feature = () => (
  <div className="min-h-screen bg-white font-sans">
    <Header />
    <main>
      <HeroSection />
      <MetricsHighlights />
      <PillarsSection />
      <WorkflowSection />
      <IntegrationShowcase />
      <CtaBanner />
    </main>
  </div>
);

export default Feature;
