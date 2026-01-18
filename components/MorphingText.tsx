
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
        className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#0093D5] to-[#306583]"
        style={{ WebkitTextStroke: '1px rgba(255, 255, 255, 0.4)' }}
      >
        {displayText}
        <span className="inline-block w-0.5 h-6 bg-gradient-to-b from-[#0093D5] to-[#306583] animate-pulse ml-1 align-middle" />
      </span>
    </span>
  );
};
