
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  { 
    id: 1, 
    quote: "KOSMA keeps our budget and cash flow in sync — no more spreadsheet chaos. It's a game changer for our multi-project workflow.", 
    name: "Sarah Meyer", 
    role: "Head of Production", 
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80" 
  },
  { 
    id: 2, 
    quote: "We finally have a single source of truth for costs and financing. The reporting tools save us hours every week.", 
    name: "Thomas Weber", 
    role: "Line Producer", 
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80" 
  },
  { 
    id: 3, 
    quote: "The intuitive interface makes complex budgeting surprisingly easy. Even our junior producers picked it up in days.", 
    name: "Julia K.", 
    role: "Producer", 
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80" 
  },
  { 
    id: 4, 
    quote: "Cost control is finally fast and accurate. I can see deviations immediately before they become problems.", 
    name: "Michael B.", 
    role: "Production Accountant", 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80" 
  },
  { 
    id: 5, 
    quote: "Managing financing sources and cash flow in one tool gives us the confidence we need for bank approvals.", 
    name: "Anna L.", 
    role: "Executive Producer", 
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80" 
  },
];

const getVisibleCount = (width: number): number => {
  if (width >= 1024) return 3;
  if (width >= 768) return 2;
  return 1;
};

const TestimonialSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<any>(null);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Resize Handler
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);
      
      const oldVisibleCount = getVisibleCount(windowWidth);
      const newVisibleCount = getVisibleCount(newWidth);
      
      if (oldVisibleCount !== newVisibleCount) {
        const maxIndexForNewWidth = Math.max(0, testimonials.length - newVisibleCount);
        if (currentIndex > maxIndexForNewWidth) {
          setCurrentIndex(maxIndexForNewWidth);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [windowWidth, currentIndex]);

  // Auto Play
  useEffect(() => {
    if (!isAutoPlaying) return;

    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        const visibleCount = getVisibleCount(windowWidth);
        const maxIndex = Math.max(0, testimonials.length - visibleCount);

        if (currentIndex >= maxIndex) {
          setDirection(-1);
          setCurrentIndex((prev) => Math.max(0, prev - 1));
        } else if (currentIndex <= 0) {
          setDirection(1);
          setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
        } else {
          // If direction is 0 (start), default to forward (1)
          const dir = direction === 0 ? 1 : direction;
          setDirection(dir);
          setCurrentIndex((prev) => {
             const next = prev + dir;
             // Boundary checks
             if (next > maxIndex) { setDirection(-1); return maxIndex - 1; }
             if (next < 0) { setDirection(1); return 1; }
             return next;
          });
        }
      }, 5000);
    };

    startAutoPlay();

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, currentIndex, windowWidth, direction]);

  const visibleCount = getVisibleCount(windowWidth);
  const maxIndex = Math.max(0, testimonials.length - visibleCount);
  const canGoNext = currentIndex < maxIndex;
  const canGoPrev = currentIndex > 0;

  const goNext = () => {
    if (canGoNext) {
      setDirection(1);
      setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
      pauseAutoPlay();
    }
  };

  const goPrev = () => {
    if (canGoPrev) {
      setDirection(-1);
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
      pauseAutoPlay();
    }
  };

  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
    // Resume after 10s
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    pauseAutoPlay();
  };

  return (
    <div className="w-full relative py-8" ref={containerRef}>
      {/* Controls - Top Right */}
      <div className="flex justify-end absolute -top-12 right-4 space-x-2 z-10 hidden sm:flex">
        <button
          onClick={goPrev}
          disabled={!canGoPrev}
          className={`p-2 rounded-full border border-gray-100 transition-all duration-300 hover:scale-105 active:scale-95 ${
            canGoPrev 
              ? 'bg-white shadow-sm hover:bg-gray-50 text-brand-600' 
              : 'bg-gray-50 text-gray-300 cursor-not-allowed'
          }`}
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={goNext}
          disabled={!canGoNext}
          className={`p-2 rounded-full border border-gray-100 transition-all duration-300 hover:scale-105 active:scale-95 ${
            canGoNext 
              ? 'bg-white shadow-sm hover:bg-gray-50 text-brand-600' 
              : 'bg-gray-50 text-gray-300 cursor-not-allowed'
          }`}
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Slider Track Window */}
      <div className="overflow-hidden relative -mx-4 sm:mx-0 px-4 sm:px-0">
        <div
          className="flex transition-transform duration-500 ease-out will-change-transform"
          style={{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }}
        >
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={`flex-shrink-0 w-full ${
                visibleCount === 3 ? 'md:w-1/3' : 
                visibleCount === 2 ? 'md:w-1/2' : 'w-full'
              } p-3`}
            >
              <div 
                className="h-full bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col relative group hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="absolute top-8 right-8 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                  <Quote className="w-10 h-10 text-brand-500" />
                </div>
                
                <div className="relative z-10 flex-1 flex flex-col">
                  <p className="text-base text-gray-600 font-medium mb-8 leading-relaxed flex-1">
                    "{testimonial.quote}"
                  </p>
                  
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="relative flex-shrink-0">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-brand-50 shadow-sm"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{testimonial.name}</h4>
                      <p className="text-xs font-black text-brand-500 uppercase tracking-widest">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
          
      {/* Pagination Dots */}
      <div className="flex justify-center mt-8 gap-2">
        {Array.from({ length: Math.max(1, testimonials.length - visibleCount + 1) }, (_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full h-2 ${
              index === currentIndex 
                ? 'w-8 bg-brand-500' 
                : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialSlider;
