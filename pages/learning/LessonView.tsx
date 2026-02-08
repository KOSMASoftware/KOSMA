
import React from 'react';
import { ArrowLeft, CheckCircle, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { SmartLink } from '../../components/SmartLink';
import { HELP_DATA, HelpArticle } from '../../data/helpArticles';
import { LearningCourse } from '../../data/learningCourses';

// --- HELPER: Find Article Content ---
const findArticleContent = (articleId: string): HelpArticle | undefined => {
  for (const cat of HELP_DATA) {
    const found = cat.articles.find(a => a.id === articleId);
    if (found) return found;
  }
  return undefined;
};

// --- COMPONENT: Media Renderer ---
const MediaRenderer = ({ media }: { media: any }) => {
  const publicUrl = supabase.storage.from(media.bucket).getPublicUrl(media.path).data.publicUrl;
  const style = (media.w && media.h) ? { aspectRatio: `${media.w} / ${media.h}` } : undefined; 
  const aspectClass = (media.w && media.h) ? '' : 'aspect-video';

  return (
    <div className={`my-6 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 max-w-2xl w-full relative ${aspectClass}`} style={style}>
      {media.kind === 'video' ? (
        <video src={publicUrl} poster={media.posterPath ? supabase.storage.from(media.bucket).getPublicUrl(media.posterPath).data.publicUrl : undefined} controls className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <img src={publicUrl} alt={media.alt || 'Help Image'} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      )}
    </div>
  );
};

interface LessonViewProps {
  course: LearningCourse;
  articleId: string;
  onBack: () => void;
  onNavigate: (articleId: string) => void;
}

export const LessonView: React.FC<LessonViewProps> = ({ 
  course, 
  articleId, 
  onBack,
  onNavigate 
}) => {
  // Find current goal index
  const currentGoalIndex = course.goals.findIndex(g => g.articleId === articleId);
  const currentGoal = course.goals[currentGoalIndex];
  const nextGoal = course.goals[currentGoalIndex + 1];
  
  // Load Content
  const article = findArticleContent(articleId);

  // Scroll to top on mount
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [articleId]);

  if (!article) return <div className="p-8 text-center">Content not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
       {/* Nav Header */}
       <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
             <ArrowLeft className="w-4 h-4" /> Back to Overview
          </button>
          <div className="text-xs font-black uppercase tracking-widest text-brand-500 bg-brand-50 px-3 py-1 rounded-full">
             Goal {currentGoalIndex + 1} / {course.goals.length}
          </div>
       </div>

       {/* Article Content */}
       <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 tracking-tight leading-tight">
            {currentGoal?.title || article.title}
          </h1>

          {article.entry.summary && (
            <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl mb-10 flex gap-4 text-blue-900/80 leading-relaxed font-medium">
               <div className="bg-white p-2 rounded-full h-fit shadow-sm border border-blue-100 shrink-0">
                  <CheckCircle className="w-5 h-5 text-brand-500" />
               </div>
               <div>
                  <p className="text-xs font-black uppercase tracking-widest text-brand-500 mb-1">Summary</p>
                  {article.entry.summary}
               </div>
            </div>
          )}

          <div className="space-y-8">
            {article.entry.steps.length === 0 && (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100 border-dashed text-gray-400 italic">
                    Content coming soon.
                </div>
            )}
            
            {article.entry.steps.map((step, idx) => (
               <div key={step.id} className="group border border-gray-100 bg-white rounded-2xl overflow-hidden p-6 md:p-8 hover:border-gray-200 hover:shadow-sm transition-all">
                   <div className="flex items-center gap-4 mb-4">
                     <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-black text-sm shrink-0">
                       {idx + 1}
                     </div>
                     <h3 className="text-xl font-bold text-gray-900">
                       {step.title}
                     </h3>
                   </div>
                   
                   <div className="pl-[3rem]">
                      <div className="text-gray-600 leading-relaxed mb-4 font-medium">
                        {/* Use SmartLink to handle [[kb:id]] references inside learning content */}
                        <SmartLink text={step.content} />
                      </div>

                      {step.media && <MediaRenderer media={step.media} />}

                      {step.warning && (
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 text-amber-800 text-sm font-medium mt-4">
                            <span className="font-bold">⚠️ Note:</span> {step.warning}
                        </div>
                      )}
                      
                      {step.tip && (
                        <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex gap-3 text-gray-600 text-sm font-medium mt-4">
                            <span className="font-bold">💡 Tip:</span> {step.tip}
                        </div>
                      )}
                   </div>
               </div>
            ))}
          </div>
       </div>

       {/* Footer Navigation */}
       <div className="mt-16 pt-10 border-t border-gray-100 flex justify-between items-center">
          <button 
             onClick={onBack}
             className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm"
          >
             Back to Overview
          </button>

          {nextGoal ? (
             <button 
                onClick={() => onNavigate(nextGoal.articleId)}
                className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gray-900 text-white font-black hover:bg-brand-500 transition-all shadow-lg shadow-gray-900/10"
             >
                <div className="text-left">
                   <span className="block text-[10px] font-bold uppercase opacity-70 tracking-wider">Next Goal</span>
                   <span>{nextGoal.title}</span>
                </div>
                <ChevronRight className="w-5 h-5" />
             </button>
          ) : (
             <div className="text-green-600 font-black flex items-center gap-2 bg-green-50 px-6 py-3 rounded-xl border border-green-100">
                <CheckCircle className="w-5 h-5" /> Course Completed
             </div>
          )}
       </div>
    </div>
  );
};
