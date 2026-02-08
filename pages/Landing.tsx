import React from 'react';
import { PulsingDotsBackground } from '../components/ui/pulsing-dots-background';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from './landing/components/HeroSection';
import { FeatureScrollytelling } from './landing/components/FeatureScrollytelling';
import { TrustSection } from './landing/components/TrustSection';

export const Landing: React.FC = () => {
  return (
      <div className="flex flex-col w-full font-sans bg-black">
          {/* 
             1. HERO CONTAINER (The "Back Layer") 
             sticky + top-0 + h-screen ensures it stays fixed in the viewport 
             while the content scrolls over it. z-0 keeps it behind.
          */}
          <div className="sticky top-0 h-screen z-0 w-full overflow-hidden">
             <HeroSection />
          </div>

          {/* 
             2. CONTENT CONTAINER (The "Front Layer" / Curtain) 
             relative + z-10 ensures it sits on top.
             bg-white is crucial to hide the hero as it scrolls up.
             shadow-2xl adds the "depth" feeling between layers.
             
             CRITICAL: Do NOT use overflow-hidden here, or position: sticky 
             inside FeatureScrollytelling will fail.
          */}
          <div className="relative z-10 bg-white w-full rounded-t-[2.5rem] shadow-[0_-25px_50px_-12px_rgba(0,0,0,0.5)]">
              <PulsingDotsBackground containerClassName="!overflow-visible">
                  {/* FEATURES SCROLLYTELLING (Includes USP Block) */}
                  <FeatureScrollytelling />

                  {/* TRUST SECTION */}
                  <TrustSection />

                  {/* FOOTER */}
                  <Footer />
              </PulsingDotsBackground>
          </div>
      </div>
  );
};