
import React, { useState, useMemo } from 'react';
import { 
  Search, ChevronRight, Home, ArrowLeft, FileText, CheckCircle, 
  AlertTriangle, Lightbulb, Image as ImageIcon, ChevronDown,
  CircleHelp, MessageCircle, Rocket, Calculator, PieChart, TrendingUp, Settings, Printer, Share2, Download,
  Maximize2, Minimize2, ChevronUp, Filter
} from 'lucide-react';
import { HELP_DATA, HelpCategory, HelpArticle, HelpStep, HelpMedia } from '../data/helpArticles';
import { UserRoleFilter } from '../data/taxonomy';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout as DashboardLayout } from '../components/Layout';
import { MarketingLayout } from '../components/layout/MarketingLayout';
import { supabase } from '../lib/supabaseClient';

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
  'Download': Download
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

const SearchBar = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => (
  <div className="relative w-full max-w-2xl mx-auto mb-8">
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
                placeholder="Suche nach Themen, z.B. 'Registrierung'..." 
                className="w-full py-5 outline-none text-lg text-gray-900 placeholder:text-gray-400 font-medium bg-transparent"
            />
        </div>
    </div>
  </div>
);

const RoleFilterBar = ({ active, onChange }: { active: string, onChange: (r: any) => void }) => {
  const roles: (UserRoleFilter | 'Alle')[] = ['Alle', 'Produktion', 'Herstellungsleitung', 'Finanzbuchhaltung'];

  return (
    <div className="flex justify-center mb-12">
      <div className="inline-flex flex-wrap justify-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => onChange(role)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              active === role
                ? 'bg-brand-500 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {role}
          </button>
        ))}
      </div>
    </div>
  );
};

const MediaRenderer = ({ media }: { media: HelpMedia }) => {
  const publicUrl = supabase.storage.from(media.bucket).getPublicUrl(media.path).data.publicUrl;

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 max-w-2xl">
      {media.kind === 'video' ? (
        <video 
            src={publicUrl} 
            poster={media.posterPath ? supabase.storage.from(media.bucket).getPublicUrl(media.posterPath).data.publicUrl : undefined}
            controls 
            className="w-full h-auto"
        />
      ) : (
        <img 
            src={publicUrl} 
            alt={media.alt || 'Help Image'} 
            loading="lazy"
            className="w-full h-auto object-cover"
        />
      )}
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-4">
         {article.roles?.map(r => (
           <span key={r} className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider">{r}</span>
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
              <p className="text-xs font-black uppercase tracking-widest text-brand-500 mb-1">Zusammenfassung</p>
              {article.entry.summary}
           </div>
        </div>
      )}

      <div className="flex justify-end mb-6">
        <button 
          onClick={toggleAll}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-brand-500 transition-colors uppercase tracking-wider"
        >
          {allOpen ? (
            <><Minimize2 className="w-4 h-4" /> Alle schließen</>
          ) : (
            <><Maximize2 className="w-4 h-4" /> Alle öffnen</>
          )}
        </button>
      </div>

      <div className="space-y-4">
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
         <p className="text-sm text-gray-500 font-medium">War dieser Artikel hilfreich?</p>
         <div className="flex justify-center gap-4 mt-4">
            <button className="px-6 py-2 rounded-full border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all text-sm font-bold">Ja, danke</button>
            <button className="px-6 py-2 rounded-full border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all text-sm font-bold">Nicht wirklich</button>
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

  // Filter Data based on Role
  const filteredData = useMemo(() => {
    return HELP_DATA.map(cat => ({
      ...cat,
      articles: cat.articles.filter(art => {
        // Falls roles fehlt oder leer ist, behandle es als "Alle" (für jeden sichtbar)
        // Sonst prüfe ob der activeRoleFilter enthalten ist
        if (!art.roles || art.roles.length === 0) return true;
        if (activeRoleFilter === 'Alle') return true;
        return art.roles.includes(activeRoleFilter);
      })
    })).filter(cat => cat.articles.length > 0 || searchQuery); // Keep empty cats only if searching (to show no results better?) actually better to hide empty cats in grid
  }, [activeRoleFilter, searchQuery]);

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
    
    filteredData.forEach(cat => {
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
  }, [searchQuery, filteredData]);

  // View: Root (Grid)
  if (!selectedCategory && !searchQuery) {
    return (
      <div className="max-w-6xl mx-auto pb-20 pt-8 px-4">
        <div className="text-center mb-8">
           <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">Learning Campus</h1>
           <p className="text-gray-500 text-lg">Schritt-für-Schritt Anleitungen für den perfekten Workflow.</p>
           <div className="mt-8">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
           </div>
        </div>

        <RoleFilterBar active={activeRoleFilter} onChange={setActiveRoleFilter} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {filteredData.map((cat) => {
             if (cat.articles.length === 0) return null; // Don't show empty categories in grid
             const IconComponent = ICON_MAP[cat.iconKey] || CircleHelp;
             return (
               <button 
                  key={cat.id} 
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group h-full flex flex-col"
               >
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 mb-6 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">{cat.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-1">{cat.description}</p>
                  <div className="flex items-center gap-2 text-xs font-black text-brand-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                    {cat.articles.length} Artikel <ChevronRight className="w-3 h-3" />
                  </div>
               </button>
             );
           })}
        </div>

        {/* Footer Teasers */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-brand-50 rounded-[2rem] p-8 border border-brand-100 flex gap-6 items-start">
              <div className="p-3 bg-white rounded-full text-brand-500 shrink-0">
                 <CircleHelp className="w-6 h-6" />
              </div>
              <div>
                 <h4 className="font-bold text-gray-900 mb-2">Begriffe nachschlagen?</h4>
                 <p className="text-sm text-gray-600 mb-4">Suchst du nach Definitionen oder technischen Erklärungen? Schau in die Knowledge Base.</p>
                 <Link to="/help" className="text-sm font-black text-brand-500 hover:underline">Zur Knowledge Base {'->'}</Link>
              </div>
           </div>
           <div className="bg-white rounded-[2rem] p-8 border border-gray-100 flex gap-6 items-start">
              <div className="p-3 bg-gray-100 rounded-full text-gray-500 shrink-0">
                 <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                 <h4 className="font-bold text-gray-900 mb-2">Fehler melden?</h4>
                 <p className="text-sm text-gray-600 mb-4">Du hast einen Bug gefunden oder hast einen Feature-Wunsch? Schreib uns direkt.</p>
                 <a href="#" className="text-sm font-black text-brand-500 hover:underline">Support kontaktieren {'->'}</a>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // View: Search Results
  if (searchQuery) {
    return (
      <div className="max-w-4xl mx-auto pb-20 pt-8 px-4">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => setSearchQuery('')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
           </button>
           <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">{searchResults.length} Ergebnisse gefunden</h2>
        
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
               <p>Keine Ergebnisse für "{searchQuery}"</p>
             </div>
           )}
        </div>
      </div>
    );
  }

  // View: Category/Article
  return (
    <div className="max-w-7xl mx-auto pb-20 pt-8 px-4 flex flex-col md:flex-row gap-12 items-start">
       <aside className="w-full md:w-64 shrink-0 sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto hidden md:block">
          <button 
            onClick={() => { setSelectedCategoryId(null); setSelectedArticleId(null); }} 
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 mb-8 hover:text-brand-500 transition-colors"
          >
             <ArrowLeft className="w-4 h-4" /> Zurück zur Übersicht
          </button>

          <div className="space-y-8">
             {filteredData.map(cat => {
               if (cat.articles.length === 0) return null;
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
                         {cat.articles.length === 0 && <span className="text-xs text-gray-300 italic pl-3">Keine Artikel</span>}
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
              {selectedArticleId ? 'Zurück zur Kategorie' : 'Zurück zur Übersicht'}
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
                     <h3 className="font-black text-gray-400 text-xs uppercase tracking-widest">Artikel in diesem Bereich</h3>
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
                        <div className="p-12 text-center text-gray-400 italic">In Kürze verfügbar.</div>
                     )}
                  </div>
               </div>
            </div>
          )}
       </main>
    </div>
  );
};

export const LearningPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const Wrapper = isAuthenticated ? DashboardLayout : MarketingLayout;
  return <Wrapper><LearningPageContent /></Wrapper>;
};
