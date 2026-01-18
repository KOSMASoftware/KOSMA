
import React, { useEffect, useState } from 'react';

interface MorphingTextProps {
  words: string[];
  className?: string;
  interval?: number;
}

export const MorphingText = ({
  words,
  className,
  interval = 3000
}: MorphingTextProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');

  const currentWord = words[currentIndex] ?? '';
  const nextWord = words[(currentIndex + 1) % words.length] ?? '';

  useEffect(() => {
    const morphDuration = 800;
    const steps = 20;
    let step = 0;

    const morphInterval = setInterval(() => {
      step += 1;
      const progress = step / steps;

      if (progress < 0.5) {
        const charCount = Math.floor(currentWord.length * (1 - progress * 2));
        setDisplayText(currentWord.slice(0, charCount));
      } else {
        const charCount = Math.floor(nextWord.length * ((progress - 0.5) * 2));
        setDisplayText(nextWord.slice(0, charCount));
      }

      if (step >= steps) {
        clearInterval(morphInterval);
        setDisplayText(nextWord);
      }
    }, morphDuration / steps);

    const wordTimeout = setTimeout(() => {
      setCurrentIndex((currentIndex + 1) % words.length);
    }, interval);

    return () => {
      clearInterval(morphInterval);
      clearTimeout(wordTimeout);
    };
  }, [currentIndex, currentWord, nextWord, interval, words.length]);

  return (
    <span className={className ? `relative inline-block ${className}` : 'relative inline-block'}>
      <span 
        className="font-black text-white tracking-wide"
        style={{ 
          textShadow: '0 0 15px rgba(0, 147, 213, 0.65), 0 0 30px rgba(0, 147, 213, 0.3)' 
        }}
      >
        {displayText}
        <span className="inline-block w-[3px] h-[1.1em] bg-[#0093D5] animate-pulse ml-1.5 align-middle shadow-[0_0_10px_#0093D5] rounded-full" />
      </span>
    </span>
  );
};
