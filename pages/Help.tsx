
import React, { useState, useMemo } from 'react';
import { 
  Search, ChevronRight, Home, ArrowLeft, FileText, CheckCircle, 
  AlertTriangle, Lightbulb, Image as ImageIcon, ChevronDown,
  CircleHelp, MessageCircle
} from 'lucide-react';
import { HELP_DATA, HelpCategory, HelpArticle } from '../data/helpArticles';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

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
      <Home className="w-3.5 h-3.5" /> Hilfe
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
  <div className="relative w-full max-w-2xl mx-auto mb-12">
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

const ArticleView = ({ article }: { article: HelpArticle }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 tracking-tight leading-tight">
        {article.title}
      </h1>

      {/* Abstract / Summary Box */}
      {article.summary && (
        <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl mb-12 flex gap-4 text-blue-900/80 leading-relaxed font-medium">
           <div className="bg-white p-2 rounded-full h-fit shadow-sm border border-blue-100 shrink-0">
              <CheckCircle className="w-5 h-5 text-brand-500" />
           </div>
           <div>
              <p className="text-xs font-black uppercase tracking-widest text-brand-500 mb-1">Zusammenfassung</p>
              {article.summary}
           </div>
        </div>
      )}

      {/* Step by Step Timeline */}
      <div className="relative space-y-12 pl-4 md:pl-0">
        {/* Continuous Line */}
        <div className="absolute left-[19px] md:left-[27px] top-4 bottom-0 w-0.5 bg-gray-100 hidden md:block"></div>

        {article.steps.map((step, idx) => (
          <div key={idx} className="relative md:pl-20 group">
            {/* Step Number Bubble */}
            <div className="absolute left-0 top-0 w-10 h-10 md:w-14 md:h-14 rounded-xl bg-white border-2 border-gray-100 flex items-center justify-center font-black text-gray-400 group-hover:border-brand-500 group-hover:text-brand-500 group-hover:scale-110 transition-all shadow-sm z-10 text-sm md:text-lg">
               {idx + 1}
            </div>

            <div className="pt-2 md:pt-3 pl-14 md:pl-0">
               <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
               <p className="text-gray-600 leading-relaxed mb-6">{step.content}</p>

               {step.image && (
                 <div className="mb-6 rounded-xl overflow-hidden border border-gray-100 shadow-lg bg-gray-50 flex flex-col items-center justify-center p-8 text-gray-400">
                    <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-xs font-mono uppercase tracking-widest opacity-50">Image: {step.image}</span>
                 </div>
               )}

               {step.warning && (
                 <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 text-amber-800 text-sm font-medium">
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
          </div>
        ))}
      </div>
      
      {/* Footer / Feedback */}
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

// --- MAIN PAGE ---

export const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  // Helper to resolve objects
  const selectedCategory = useMemo(() => 
    HELP_DATA.find(c => c.id === selectedCategoryId), 
  [selectedCategoryId]);

  const selectedArticle = useMemo(() => 
    selectedCategory?.articles.find(a => a.id === selectedArticleId), 
  [selectedCategory, selectedArticleId]);

  // Search Logic
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const results: { category: HelpCategory, article: HelpArticle }[] = [];
    HELP_DATA.forEach(cat => {
      cat.articles.forEach(art => {
        if (art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
            art.steps.some(s => s.content.toLowerCase().includes(searchQuery.toLowerCase()))) {
            results.push({ category: cat, article: art });
        }
      });
    });
    return results;
  }, [searchQuery]);

  // --- VIEWS ---

  // 1. Root View (Grid of Categories)
  if (!selectedCategory && !searchQuery) {
    return (
      <div className="max-w-6xl mx-auto pb-20 pt-8 px-4">
        <div className="text-center mb-16">
           <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">How can we help?</h1>
           <p className="text-gray-500 text-lg">Find answers, solve problems, and level-up.</p>
           <div className="mt-10">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {HELP_DATA.map((cat) => (
             <button 
                key={cat.id} 
                onClick={() => setSelectedCategoryId(cat.id)}
                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group h-full flex flex-col"
             >
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 mb-6 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                  <cat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">{cat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-1">{cat.description}</p>
                <div className="flex items-center gap-2 text-xs font-black text-brand-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                  {cat.articles.length} Artikel <ChevronRight className="w-3 h-3" />
                </div>
             </button>
           ))}
        </div>

        {/* Learning Campus Teaser */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-brand-50 rounded-[2rem] p-8 border border-brand-100 flex gap-6 items-start">
              <div className="p-3 bg-white rounded-full text-brand-500 shrink-0">
                 <CircleHelp className="w-6 h-6" />
              </div>
              <div>
                 <h4 className="font-bold text-gray-900 mb-2">Brauchst du mehr Hilfe?</h4>
                 <p className="text-sm text-gray-600 mb-4">Wenn du Probleme mit KOSMA hast, findest du die Antwort vielleicht in unserem Learning Campus.</p>
                 <a href="#" className="text-sm font-black text-brand-500 hover:underline">Zum Learning Campus {'->'}</a>
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

  // 2. Search Results View
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
           {searchResults.map((res, idx) => (
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
                   <res.category.icon className="w-3 h-3" />
                   {res.category.title}
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{res.article.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{res.article.summary}</p>
             </button>
           ))}
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

  // 3. Category / Article View (Two Column Layout)
  return (
    <div className="max-w-7xl mx-auto pb-20 pt-8 px-4 flex flex-col md:flex-row gap-12 items-start">
       
       {/* Sidebar Navigation */}
       <aside className="w-full md:w-64 shrink-0 sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto hidden md:block">
          <button 
            onClick={() => { setSelectedCategoryId(null); setSelectedArticleId(null); }} 
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 mb-8 hover:text-brand-500 transition-colors"
          >
             <ArrowLeft className="w-4 h-4" /> Zurück zur Übersicht
          </button>

          <div className="space-y-8">
             {HELP_DATA.map(cat => (
               <div key={cat.id}>
                  <button 
                    onClick={() => { setSelectedCategoryId(cat.id); setSelectedArticleId(null); }}
                    className={`flex items-center gap-2 font-bold mb-3 w-full text-left transition-colors hover:text-brand-600 ${cat.id === selectedCategoryId ? 'text-brand-600' : 'text-gray-900'}`}
                  >
                     <cat.icon className={`w-4 h-4 ${cat.id === selectedCategoryId ? 'text-brand-500' : 'text-gray-400'}`} />
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
             ))}
          </div>
       </aside>

       {/* Mobile Back Button (visible only on mobile) */}
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

       {/* Main Content Area */}
       <main className="flex-1 min-w-0">
          {selectedArticle ? (
            <>
              <div className="hidden md:block">
                <Breadcrumbs 
                    items={[
                        { label: selectedCategory!.title, id: selectedCategory!.id },
                        { label: selectedArticle.title, id: null } // current
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
            // Category Overview (when category selected but no article)
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-brand-50 text-brand-500 rounded-2xl flex items-center justify-center">
                     {React.createElement(selectedCategory!.icon, { className: "w-8 h-8" })}
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
                            <h4 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{art.title}</h4>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{art.summary}</p>
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
