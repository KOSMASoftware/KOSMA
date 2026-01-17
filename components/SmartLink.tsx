
import React from 'react';
import { Link } from 'react-router-dom';
import { KNOWLEDGE_ARTICLES } from '../data/knowledge-data';
import { LEARNING_DATA } from '../data/learning-data';
import { BookOpen, Rocket } from 'lucide-react';

interface SmartLinkProps {
  text: string;
  className?: string;
}

export const SmartLink: React.FC<SmartLinkProps> = ({ text, className = "" }) => {
  if (!text) return null;

  // Regex to find [[type:id]] patterns
  // Examples: [[kb:magic-link]], [[learn:registration]]
  const parts = text.split(/(\[\[.*?:.*?\]\])/g);

  return (
    <span className={`leading-relaxed ${className}`}>
      {parts.map((part, index) => {
        const match = part.match(/^\[\[(kb|learn):(.*?)\]\]$/);
        
        if (match) {
          const type = match[1];
          const id = match[2];

          if (type === 'kb') {
            const article = KNOWLEDGE_ARTICLES.find(a => a.id === id);
            if (!article) return <span key={index} className="text-red-400 font-mono text-xs" title="Broken Link">{id}</span>;
            
            return (
              <Link 
                key={index} 
                to={`/help/${id}`} 
                className="inline-flex items-baseline gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-900 font-medium transition-colors border border-blue-100 mx-0.5 decoration-0"
                title={`Knowledge Base: ${article.title}`}
              >
                <BookOpen className="w-3 h-3 self-center opacity-50" />
                {article.title}
              </Link>
            );
          }

          if (type === 'learn') {
             // For Learning Campus, we just link to /learning main page or if deep linking supported in future
             // For now, the user requested strict 1:1 revert of Learning Campus which doesn't support deep linking to articles via URL directly
             // But we can link to the main page
             return (
               <Link 
                 key={index} 
                 to={`/learning`} 
                 className="inline-flex items-baseline gap-1 px-1.5 py-0.5 rounded-md bg-brand-50 text-brand-700 hover:bg-brand-100 font-medium transition-colors border border-brand-100 mx-0.5 decoration-0"
               >
                 <Rocket className="w-3 h-3 self-center opacity-50" />
                 Learning Campus
               </Link>
             );
          }
        }
        return part;
      })}
    </span>
  );
};
