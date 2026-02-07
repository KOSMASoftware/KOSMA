import React from 'react';
import TestimonialSlider from '../../../components/TestimonialSlider';

export const TrustSection = () => {
  return (
    <section className="py-16 relative z-10">
       <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
               Trusted by production teams who need budget certainty.
             </h2>
             <p className="text-base md:text-lg text-gray-500 font-medium leading-relaxed">
               From budgeting to cash flow and cost control — KOSMA keeps every project financially aligned.
             </p>
          </div>

          {/* Testimonial Slider */}
          <div className="w-full">
             <TestimonialSlider />
          </div>
       </div>
    </section>
  );
};