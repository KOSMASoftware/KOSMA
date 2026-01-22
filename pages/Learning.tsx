
import React, { useState, useMemo } from 'react';
import { 
  Search, ChevronRight, Home, ArrowLeft, FileText, CheckCircle, 
  AlertTriangle, Lightbulb, Image as ImageIcon, ChevronDown,
  CircleHelp, MessageCircle, Rocket, Calculator, PieChart, TrendingUp, Settings, Printer, Share2, Download,
  Maximize2, Minimize2, ChevronUp, Filter, ShieldCheck, Coins, LayoutGrid, List, Map, Clock
} from 'lucide-react';
import { HELP_DATA, HelpCategory, HelpArticle, HelpStep, HelpMedia } from '../data/helpArticles';
import { UserRoleFilter, ROLE_LABELS } from '../data/taxonomy';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout as DashboardLayout } from '../components/Layout';
import { MarketingLayout } from '../components/layout/MarketingLayout';
import { supabase } from '../lib/supabaseClient';
import { Card } from '../components/ui/Card';

// --- ICON MAPPING ---
const ICON_MAP: Record<string, any> = {
  'Rocket': Rocket,
  'Calculator': Calculator,
  'PieChart': PieChart,
  'TrendingUp': TrendingUp,
  'Settings': Settings,
  'CircleHelp': CircleHelp,
  'Printer': Printer,
  'FileText': FileText,
  'Share2': Share2,
  'Download': Download,
  'ShieldCheck': ShieldCheck,
  'Coins': Coins
};

// --- COLOR MAPPING ---
const CATEGORY_COLORS: Record<string, string> = {
  'project-basics': '#5CB912', // Green
  'budgeting': '#0093D5',      // Brand Blue
  'financing': '#305583',      // Blue Dark
  'cash-flow': '#FD7A36',      // Cashflow Orange
  'cost-control': '#7A62D2',   // Cost Control Purple
  'reporting': '#ADB5BD',      // Gray
};

// --- COMPONENTS ---

const Breadcrumbs = ({ 
  items, 
  onNavigate 
}: { 
  items: { label: string; id?: string | null }[], 
  onNavigate: (id: string | null) => void 
}) => (
  <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap">
    <button onClick={() => onNavigate(null)} className="hover:text-brand-500 transition-colors flex items-center gap-1">
      <Home className="w-3.5 h-3.5" /> Learning Campus
    </button>
    {items.map((item, idx) => (
      <React.Fragment key={idx}>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
        {item.id ? (
          <button onClick={() => onNavigate(item.id!)} className="hover:text-brand-500 transition-colors font-medium">
            {item.label}
          </button>
        ) : (
          <span className="font-bold text-gray-900">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </div>
);

const SearchBar = ({ value, onChange, className }: { value: string, onChange: (v: string) => void, className?: string }) => (
  <div className={`relative w-full ${className || ''}`}>
    <div className="relative group">
        <div className="absolute inset-0 bg-brand-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all">
            <div className="pl-6 pr-4 text-gray-400">
                <Search className="w-5 h-5" />
            </div>
            <input 
                type="text" 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search for topics, e.g. 'Registration'..." 
                className="w-full py-5 outline-none text-lg text-gray-900 placeholder:text-gray-400 font-medium bg-transparent"
                autoFocus={!!value}
            />
        </div>
    </div>
  </div>
);

const RoleFilterBar = ({ active, onChange }: { active: string, onChange: (r: any) => void }) => {
  const roles: (UserRoleFilter | 'Alle')[] = ['Alle', 'Produktion', 'Herstellungsleitung', 'Finanzbuchhaltung'];

  return (
    <div className="flex flex-col items-center">
      {/* Action Line Hint */}
      <p className="text-center text-gray-500 mb-3 font-medium animate-in fade-in text-xs uppercase tracking-wider">
          {active === 'Alle'
            ? "Filter by Role"
            : <>Filtered for <span className="text-brand-500 font-bold">{ROLE_LABELS[active as UserRoleFilter] || active}</span></>}
      </p>

      <div className="inline-flex flex-wrap justify-center gap-1 bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => onChange(role)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              active === role
                ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {ROLE_LABELS[role]}
          </button>
        ))}
      </div>
    </div>
  );
};

const ViewSwitcher = ({ mode, onChange }: { mode: 'grid' | 'path', onChange: (m: 'grid' | 'path') => void }) => (
  <div className="inline-flex bg-gray-100 p-1 rounded-xl shadow-inner">
    <button
      onClick={() => onChange('grid')}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
        mode === 'grid' 
          ? 'bg-white text-gray-900 shadow-sm' 
          : 'text-gray-500 hover:text-gray-900'
      }`}
    >
      <LayoutGrid className="w-4 h-4" /> Grid
    </button>
    <button
      onClick={() => onChange('path')}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
        mode === 'path' 
          ? 'bg-white text-gray-900 shadow-sm' 
          : 'text-gray-500 hover:text-gray-900'
      }`}
    >
      <Map className="w-4 h-4" /> Path
    </button>
  </div>
);

const MediaRenderer = ({ media }: { media: HelpMedia }) => {
  const publicUrl = supabase.storage.from(media.bucket).getPublicUrl(media.path).data.publicUrl;

  const style = (media.w && media.h) 
    ? { aspectRatio: `${media.w} / ${media.h}` } 
    : undefined; 
  
  const aspectClass = (media.w && media.h) ? '' : 'aspect-video';

  return (
    <div 
        className={`my-6 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 max-w-2xl w-full relative ${aspectClass}`}
        style={style}
    >
      {media.kind === 'video' ? (
        <video 
            src={publicUrl} 
            poster={media.posterPath ? supabase.storage.from(media.bucket).getPublicUrl(media.posterPath).data.publicUrl : undefined}
            controls 
            className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <img 
            src={publicUrl} 
            alt={media.alt || 'Help Image'} 
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
};

// --- LEARNING PATH VIEW ---
const LearningPathView = ({ 
  categories, 
  onSelectArticle 
}: { 
  categories: { id: string, title: string, iconKey: string, articles: HelpArticle[] }[],
  onSelectArticle: (catId: string, artId: string) => void
}) => {
  return (
    <div className="max-w-3xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="relative border-l-2 border-gray-100 ml-4 md:ml-10 space-y-16 pb-12">
        {categories.map((cat, catIdx) => {
          const catColor = CATEGORY_COLORS[cat.id] || '#0093D5';
          const Icon = ICON_MAP[cat.iconKey] || CircleHelp;

          return (
            <div key={cat.id} className="relative pl-8 md:pl-12">
               {/* Timeline Dot */}
               <div 
                 className="absolute -left-[21px] top-0 w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10"
                 style={{ backgroundColor: catColor, color: 'white' }}
               >
                 <span className="text-xs font-black">{catIdx + 1}</span>
               </div>
               
               {/* Category Header */}
               <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-2xl font-black tracking-tight text-gray-900">{cat.title}</h3>
                  <div className="h-px bg-gray-100 flex-1"></div>
               </div>
               
               {/* Articles List */}
               <div className="space-y-4">
                 {cat.articles.map((art) => (
                    <div 
                      key={art.id}
                      onClick={() => onSelectArticle(cat.id, art.id)}
                      className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-l-4 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                      style={{ borderLeftColor: 'transparent' }} // Standard state
                    >
                       <div 
                          className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-brand-500 transition-colors"
                          style={{ backgroundColor: 'transparent' }} 
                       ></div>
                       
                       <div className="flex justify-between items-start gap-4">
                          <div>
                             <h4 className="font-bold text-gray-900 text-lg group-hover:text-brand-600 transition-colors">{art.title}</h4>
                             <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">{art.entry.summary || 'No summary available.'}</p>
                             
                             <div className="flex items-center gap-3 mt-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                                   <Clock className="w-3 h-3" /> ~5 min
                                </span>
                                {art.roles && art.roles.length > 0 && (
                                   <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500 bg-brand-50 px-2 py-0.5 rounded-md">
                                      {art.roles[0]}
                                   </span>
                                )}
                             </div>
                          </div>
                          <div className="p-2 bg-gray-50 rounded-full text-gray-300 group-hover:bg-brand-500 group-hover:text-white transition-all">
                             <ChevronRight className="w-5 h-5" />
                          </div>
                       </div>
                    </div>
                 ))}
               </div>
            </div>
          );
        })}
        
        {/* Finish Line */}
        <div className="relative pl-8 md:pl-12 pt-4">
           <div className="absolute -left-[11px] top-4 w-6 h-6 rounded-full border-4 border-white bg-gray-200 z-10"></div>
           <p className="text-gray-400 text-sm font-medium italic">You've reached the end of this learning path.</p>
        </div>
      </div>
    </div>
  );
};

const ArticleView = ({ article }: { article: HelpArticle }) => {
  const [openStepIds, setOpenStepIds] = useState<Set<string>>(new Set());

  const allStepIds = useMemo(() => article.entry.steps.map(s => s.id), [article]);
  const allOpen = openStepIds.size === allStepIds.length;

  const toggleStep = (id: string) => {
    const newSet = new Set(openStepIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setOpenStepIds(newSet);
  };

  const toggleAll = () => {
    if (allOpen) {
      setOpenStepIds(new Set());
    } else {
      setOpenStepIds(new Set(allStepIds));
    }
  };

  const getRoleLabel = (r: string) => ROLE_LABELS[r as UserRoleFilter] || r;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-4">
         {article.roles?.map(r => (
           <span key={r} className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider">{getRoleLabel(r)}</span>
         ))}
      </div>
      <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 tracking-tight leading-tight">
        {article.title}
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

      {article.entry.steps.length > 0 && (
        <div className="flex justify-end mb-6">
          <button 
            onClick={toggleAll}
            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-brand-500 transition-colors uppercase tracking-wider"
          >
            {allOpen ? (
              <><Minimize2 className="w-4 h-4" /> Close all</>
            ) : (
              <><Maximize2 className="w-4 h-4" /> Open all</>
            )}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {article.entry.steps.length === 0 && (
            <div className="p-12 text-center bg-gray-50 rounded-2xl border border-gray-100 border-dashed text-gray-400 italic">
                Content coming soon.
            </div>
        )}
        
        {article.entry.steps.map((step, idx) => {
          const isOpen = openStepIds.has(step.id);
          
          return (
            <div key={step.id} className={`group border transition-all duration-300 rounded-2xl overflow-hidden ${isOpen ? 'border-brand-200 bg-white shadow-lg shadow-brand-500/5' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
               <button 
                 onClick={() => toggleStep(step.id)}
                 className="w-full flex items-center justify-between p-5 text-left"
               >
                 <div className="flex items-center gap-4">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm transition-colors ${isOpen ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                     {idx + 1}
                   </div>
                   <h3 className={`text-lg font-bold transition-colors ${isOpen ? 'text-brand-700' : 'text-gray-900'}`}>
                     {step.title}
                   </h3>
                 </div>
                 {isOpen ? <ChevronUp className="w-5 h-5 text-brand-300" /> : <ChevronDown className="w-5 h-5 text-gray-300" />}
               </button>
               
               {isOpen && (
                 <div className="px-5 pb-8 pl-[4.5rem] animate-in slide-in-from-top-2 duration-200">
                    <p className="text-gray-600 leading-relaxed mb-4">{step.content}</p>

                    {step.media && (
                      <MediaRenderer media={step.media} />
                    )}

                    {step.warning && (
                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 text-amber-800 text-sm font-medium mt-4">
                          <AlertTriangle className="w-5 h-5 shrink-0" />
                          {step.warning}
                      </div>
                    )}
                    
                    {step.tip && (
                      <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex gap-3 text-gray-600 text-sm font-medium mt-4">
                          <Lightbulb className="w-5 h-5 shrink-0 text-gray-400" />
                          {step.tip}
                      </div>
                    )}
                 </div>
               )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-20 pt-10 border-t border-gray-100 text-center">
         <p className="text-sm text-gray-500 font-medium">Was this article helpful?</p>
         <div className="flex justify-center gap-4 mt-4">
            <button className="px-6 py-2 rounded-full border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all text-sm font-bold">Yes, thanks</button>
            <button className="px-6 py-2 rounded-full border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all text-sm font-bold">Not really</button>
         </div>
      </div>
    </div>
  );
};

const LearningPageContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [activeRoleFilter, setActiveRoleFilter] = useState<UserRoleFilter | 'Alle'>('Alle');
  const [viewMode, setViewMode] = useState<'grid' | 'path'>('grid');

  const filteredData = useMemo(() => {
    return HELP_DATA.map(cat => ({
      ...cat,
      articles: cat.articles.filter(art => {
        if (!art.roles || art.roles.length === 0) return true;
        if (activeRoleFilter === 'Alle') return true;
        return art.roles.includes(activeRoleFilter);
      })
    })).filter(cat => cat.articles.length > 0);
  }, [activeRoleFilter]); 

  const selectedCategory = useMemo(() => 
    filteredData.find(c => c.id === selectedCategoryId), 
  [selectedCategoryId, filteredData]);

  const selectedArticle = useMemo(() => 
    selectedCategory?.articles.find(a => a.id === selectedArticleId), 
  [selectedCategory, selectedArticleId]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const lowerQ = searchQuery.toLowerCase();
    const results: { category: HelpCategory, article: HelpArticle }[] = [];
    
    HELP_DATA.forEach(cat => {
      cat.articles.forEach(art => {
        const titleMatch = art.title.toLowerCase().includes(lowerQ);
        const summaryMatch = (art.entry.summary || '').toLowerCase().includes(lowerQ);
        const stepsMatch = art.entry.steps.some(s => s.content.toLowerCase().includes(lowerQ) || s.title.toLowerCase().includes(lowerQ));
        
        if (titleMatch || summaryMatch || stepsMatch) {
            results.push({ category: cat, article: art });
        }
      });
    });
    return results;
  }, [searchQuery]);

  // Case 1: Category/Article Detail View (Sidebar Layout)
  // We use this layout only if we are browsing (category selected) AND NOT searching.
  // Searching overrides this view to show global results.
  if (selectedCategory && !searchQuery) {
    return (
      <div className="max-w-7xl mx-auto pb-20 pt-8 px-4 flex flex-col md:flex-row gap-12 items-start">
         <aside className="w-full md:w-64 shrink-0 sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto hidden md:block">
            <button 
              onClick={() => { setSelectedCategoryId(null); setSelectedArticleId(null); }} 
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 mb-8 hover:text-brand-500 transition-colors"
            >
               <ArrowLeft className="w-4 h-4" /> Back to overview
            </button>

            <div className="space-y-8">
               {filteredData.map(cat => {
                 const CatIcon = ICON_MAP[cat.iconKey] || CircleHelp;
                 return (
                   <div key={cat.id}>
                      <button 
                        onClick={() => { setSelectedCategoryId(cat.id); setSelectedArticleId(null); }}
                        className={`flex items-center gap-2 font-bold mb-3 w-full text-left transition-colors hover:text-brand-600 ${cat.id === selectedCategoryId ? 'text-brand-600' : 'text-gray-900'}`}
                      >
                         <CatIcon className={`w-4 h-4 ${cat.id === selectedCategoryId ? 'text-brand-500' : 'text-gray-400'}`} />
                         {cat.title}
                      </button>
                      {cat.id === selectedCategoryId && (
                        <div className="pl-6 space-y-1 border-l-2 border-gray-100">
                           {cat.articles.map(art => (
                             <button
                               key={art.id}
                               onClick={() => setSelectedArticleId(art.id)}
                               className={`block w-full text-left py-2 px-3 text-sm rounded-lg transition-all ${
                                 art.id === selectedArticleId 
                                   ? 'bg-brand-50 text-brand-700 font-bold' 
                                   : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                               }`}
                             >
                               {art.title}
                             </button>
                           ))}
                           {cat.articles.length === 0 && <span className="text-xs text-gray-300 italic pl-3">No Articles</span>}
                        </div>
                      )}
                   </div>
                 );
               })}
            </div>
         </aside>

         <div className="md:hidden w-full">
           <button 
                onClick={() => { 
                    if (selectedArticleId) setSelectedArticleId(null);
                    else setSelectedCategoryId(null);
                }} 
                className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-6 bg-white p-3 rounded-xl border border-gray-100 shadow-sm w-full justify-center"
              >
                <ArrowLeft className="w-4 h-4" /> 
                {selectedArticleId ? 'Back to category' : 'Back to overview'}
           </button>
         </div>

         <main className="flex-1 min-w-0">
            {selectedArticle ? (
              <>
                <div className="hidden md:block">
                  <Breadcrumbs 
                      items={[
                          { label: selectedCategory!.title, id: selectedCategory!.id },
                          { label: selectedArticle.title, id: null }
                      ]}
                      onNavigate={(id) => {
                          if (id) { setSelectedCategoryId(id); setSelectedArticleId(null); }
                          else { setSelectedCategoryId(null); setSelectedArticleId(null); }
                      }}
                  />
                </div>
                <ArticleView article={selectedArticle} />
              </>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-brand-50 text-brand-500 rounded-2xl flex items-center justify-center">
                       {React.createElement(ICON_MAP[selectedCategory!.iconKey] || CircleHelp, { className: "w-8 h-8" })}
                    </div>
                    <div>
                      <h1 className="text-3xl font-black text-gray-900 tracking-tight">{selectedCategory!.title}</h1>
                      <p className="text-gray-500">{selectedCategory!.description}</p>
                    </div>
                 </div>

                 <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                       <h3 className="font-black text-gray-400 text-xs uppercase tracking-widest">Articles in this section</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                       {selectedCategory!.articles.map(art => (
                         <button 
                           key={art.id}
                           onClick={() => setSelectedArticleId(art.id)}
                           className="w-full text-left p-6 hover:bg-gray-50 transition-colors flex justify-between items-center group"
                         >
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{art.title}</h4>
                              </div>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-1">{art.entry.summary || ''}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-500 transition-colors" />
                         </button>
                       ))}
                       {selectedCategory!.articles.length === 0 && (
                          <div className="p-12 text-center text-gray-400 italic">Coming soon.</div>
                       )}
                    </div>
                 </div>
              </div>
            )}
         </main>
      </div>
    );
  }

  // Case 2: Discovery View (Overview OR Search Results)
  // Shared layout to prevent SearchBar unmount/remount which causes focus loss.
  const isSearchActive = !!searchQuery;

  return (
    <div className={`mx-auto px-4 pt-8 pb-20 transition-all duration-500 ${isSearchActive ? 'max-w-4xl' : 'max-w-6xl'}`}>
       
       {/* HEADER SECTION (Stable wrapper for SearchBar) */}
       <div className="mb-10">
          {!isSearchActive && (
             <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">Learning Campus</h1>
                <p className="text-gray-500 text-lg">Step-by-step guides for the perfect budget.</p>
             </div>
          )}

          {/* Search Bar Container */}
          <div className={`mx-auto flex items-center gap-4 transition-all duration-300 ease-in-out ${isSearchActive ? 'w-full' : 'max-w-2xl'}`}>
             {isSearchActive && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors shrink-0 animate-in fade-in slide-in-from-right-2"
                >
                   <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
             )}
             
             <div className="flex-1">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
             </div>
          </div>
       </div>

       {/* CONTENT AREA */}
       {isSearchActive ? (
          /* SEARCH RESULTS */
          <div className="animate-in fade-in slide-in-from-bottom-4">
             <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">{searchResults.length} results found</h2>
             <div className="space-y-4">
                {searchResults.map((res, idx) => {
                  const CatIcon = ICON_MAP[res.category.iconKey] || CircleHelp;
                  return (
                    <button 
                      key={idx}
                      onClick={() => {
                        setSelectedCategoryId(res.category.id);
                        setSelectedArticleId(res.article.id);
                        setSearchQuery('');
                      }}
                      className="w-full text-left bg-white p-6 rounded-2xl border border-gray-100 hover:border-brand-300 hover:shadow-md transition-all group"
                    >
                       <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2">
                          <CatIcon className="w-3 h-3" />
                          {res.category.title}
                       </div>
                       <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{res.article.title}</h3>
                       <p className="text-sm text-gray-500 mt-1 line-clamp-1">{res.article.entry.summary || ''}</p>
                    </button>
                  );
                })}
                {searchResults.length === 0 && (
                  <div className="text-center py-20 text-gray-400">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No results for "{searchQuery}"</p>
                  </div>
                )}
             </div>
          </div>
       ) : (
          /* OVERVIEW GRID */
          <div className="animate-in fade-in slide-in-from-bottom-4">
             {/* Symmetrical Control Bar */}
             <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-100 pb-6 mb-8 relative">
                {/* Left Spacer for Balance (Hidden on mobile) */}
                <div className="hidden md:block flex-1"></div>

                {/* Center: Role Filter */}
                <div className="flex-initial">
                   <RoleFilterBar active={activeRoleFilter} onChange={setActiveRoleFilter} />
                </div>

                {/* Right: View Switcher */}
                <div className="flex-1 flex justify-center md:justify-end w-full md:w-auto">
                   <ViewSwitcher mode={viewMode} onChange={setViewMode} />
                </div>
             </div>

             {viewMode === 'path' ? (
                <LearningPathView 
                   categories={filteredData} 
                   onSelectArticle={(catId, artId) => {
                      setSelectedCategoryId(catId);
                      setSelectedArticleId(artId);
                   }} 
                />
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {filteredData.map((cat, index) => {
                     const IconComponent = ICON_MAP[cat.iconKey] || CircleHelp;
                     const cardColor = CATEGORY_COLORS[cat.id] || '#0093D5';
                     return (
                       <Card 
                          key={cat.id} 
                          onClick={() => setSelectedCategoryId(cat.id)}
                          color={cardColor}
                          interactive
                          enableLedEffect={true}
                          className="group text-left items-start h-full"
                       >
                          <div className="absolute top-2 left-4 text-[4rem] font-black text-gray-100/80 leading-none select-none z-0 pointer-events-none transition-colors group-hover:text-gray-100">
                            0{index + 1}
                          </div>

                          <div className="flex justify-center mb-6 w-full relative z-10">
                            <IconComponent 
                                className="w-12 h-12 opacity-90 transition-transform group-hover:scale-110" 
                                style={{ color: cardColor }}
                            />
                          </div>
                          
                          <h3 
                            className="text-2xl font-black mb-4 w-full text-center relative z-10"
                            style={{ color: cardColor }}
                          >{cat.title}</h3>
                          
                          <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8 flex-1 text-center w-full relative z-10">{cat.description}</p>
                          
                          <div className="w-full border-t border-gray-100 pt-6 mt-auto relative z-10">
                            <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors">
                                {cat.articles.length} Articles <ChevronRight className="w-3 h-3" />
                            </div>
                          </div>
                       </Card>
                     );
                   })}
                </div>
             )}

             {/* Footer Teasers */}
             <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-brand-50 rounded-[2rem] p-8 border border-brand-100 flex gap-6 items-start">
                   <div className="p-3 bg-white rounded-full text-brand-500 shrink-0">
                      <CircleHelp className="w-6 h-6" />
                   </div>
                   <div>
                      <h4 className="font-bold text-gray-900 mb-2">Look up terms?</h4>
                      <p className="text-sm text-gray-600 mb-4">Looking for definitions or explanations? Check the Knowledge Base.</p>
                      <Link to="/help" className="text-sm font-black text-brand-500 hover:underline">Go to Knowledge Base {'->'}</Link>
                   </div>
                </div>
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 flex gap-6 items-start">
                   <div className="p-3 bg-gray-100 rounded-full text-gray-500 shrink-0">
                      <MessageCircle className="w-6 h-6" />
                   </div>
                   <div>
                      <h4 className="font-bold text-gray-900 mb-2">Report a bug?</h4>
                      <p className="text-sm text-gray-600 mb-4">Found a bug or have a feature request? Contact us directly.</p>
                      <Link to="/support" className="text-sm font-black text-brand-500 hover:underline">Contact support {'->'}</Link>
                   </div>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

export const LearningPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const Wrapper = isAuthenticated ? DashboardLayout : MarketingLayout;
  return <Wrapper><LearningPageContent /></Wrapper>;
};
