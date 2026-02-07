import React from 'react';
import { PulsingDotsBackground } from '../components/ui/pulsing-dots-background';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from './landing/components/HeroSection';
import { FeatureScrollytelling } from './landing/components/FeatureScrollytelling';
import { TrustSection } from './landing/components/TrustSection';

export const Landing: React.FC = () => {
  return (
      <div className="flex flex-col w-full font-sans bg-white">
          {/* HERO SECTION - OUTSIDE PulsingDotsBackground */}
          <HeroSection />

          {/* CONTENT SECTION - WRAPPED IN DOTS WITH OVERFLOW VISIBLE */}
          <PulsingDotsBackground containerClassName="overflow-visible relative z-10">
              {/* FEATURES SCROLLYTELLING (Includes USP Block) */}
              <FeatureScrollytelling />

              {/* TRUST SECTION */}
              <TrustSection />

              {/* FOOTER */}
              <Footer />
          </PulsingDotsBackground>
      </div>
  );
};