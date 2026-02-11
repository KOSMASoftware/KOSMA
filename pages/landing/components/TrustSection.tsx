
import React from 'react';
import TestimonialSlider from '../../../components/TestimonialSlider';
import { H2, Paragraph } from '../../../components/ui/Typography';

export const TrustSection = () => {
  return (
    <section className="py-16 relative z-10">
       <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <H2 className="mb-6 leading-tight">
               Trusted by production teams who need budget certainty.
             </H2>
             <Paragraph className="text-lg font-medium">
               From budgeting to cash flow and cost control — KOSMA keeps every project financially aligned.
             </Paragraph>
          </div>

          {/* Testimonial Slider */}
          <div className="w-full">
             <TestimonialSlider />
          </div>
       </div>
    </section>
  );
};
