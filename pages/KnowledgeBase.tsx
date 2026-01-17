
import React, { useState, useMemo } from 'react';
import { 
  Search, BookOpen, ArrowLeft, ExternalLink,
  CornerDownRight, Hash, GraduationCap, LayoutDashboard
} from 'lucide-react';
import { KNOWLEDGE_CATEGORIES, KNOWLEDGE_ARTICLES, KnowledgeArticle } from '../data/knowledge-data';
import { LEARNING_DATA } from '../data/learning-data';
import { DOC_ICONS } from '../data/taxonomy';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout as DashboardLayout } from '../components/Layout';
import { MarketingLayout } from '../components/layout/MarketingLayout';
import { SmartLink } from '../components/SmartLink';

// --- COMPONENTS ---

const ArticleDetail = ({ article }: { article: KnowledgeArticle }) => {
  const relatedLearning = useMemo(() => {
     const results: { id: string, title: string, category: string }[] = [];
     if (!article.relatedLearningIds) return results;
     
     // Find referenced learning modules
     LEARNING_DATA.forEach(cat => {
         cat.articles.forEach(art => {
             if (article.relatedLearningIds?.includes(art.id)) {
                 results.push({ id: art.id, title: art.title, category: cat.title });
             }
         });
     });
     return results;
  }, [article]);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-brand-500 mb-4">
          <BookOpen className="w-4 h-4" /> Knowledge Base
       </div>
       <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 tracking-tight">{article.title}</h1>

       {/* Definition Box */}
       <div className="text-xl md:text-2xl leading-relaxed text-gray-600 mb-12 font-medium border-l-4 border-brand-500 pl-6 py-2">
          {article.content.definition}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
             {article.content.sections.map((section, idx) => (
               <div key={idx}>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                     <Hash className="w-5 h-5 text-gray-300" /> {section.heading}
                  </h2>
                  <div className={`prose prose-lg text-gray-600 ${section.type === 'technical' ? 'bg-gray-50 p-6 rounded-2xl border border-gray-100 text-sm font-mono' : ''}`}>
                     <SmartLink text={section.body} />
                  </div>
               </div>
             ))}
          </div>

          {/* Sidebar: Applied Knowledge */}
          <div className="space-y-8">
             {relatedLearning.length > 0 && (
                <div className="bg-brand-50/50 rounded-2xl p-6 border border-brand-100">
                   <h3 className="font-black text-brand-900 uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" /> Praktische Anwendung
                   </h3>
                   <ul className="space-y-3">
                      {relatedLearning.map(learn => (
                         <li key={learn.id}>
                            <Link to={`/learning`} className="block bg-white p-4 rounded-xl shadow-sm border border-brand-100 hover:shadow-md hover:border-brand-300 transition-all group">
                               <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">{learn.category}</div>
                               <div className="text-sm font-bold text-gray-900 group-hover:text-brand-600 flex items-center justify-between">
                                  {learn.title}
                                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                               </div>
                            </Link>
                         </li>
                      ))}
                   </ul>
                </div>
             )}
             
             {article.synonyms && (
                <div className="p-6">
                   <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-2">Synonyme</h3>
                   <div className="flex flex-wrap gap-2">
                      {article.synonyms.map(syn => (
                        <span key={syn} className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium">
                           {syn}
                        </span>
                      ))}
                   </div>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

// --- MAIN PAGE ---

const KnowledgeBaseContent: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Search Logic: Simple Fuzzy-ish
  const searchResults = useMemo(() => {
    if (!search) return [];
    const lower = search.toLowerCase();
    return KNOWLEDGE_ARTICLES.filter(a => 
       a.title.toLowerCase().includes(lower) || 
       a.synonyms?.some(s => s.toLowerCase().includes(lower)) ||
       a.content.definition.toLowerCase().includes(lower)
    );
  }, [search]);

  // View: Article Detail
  if (id) {
    const article = KNOWLEDGE_ARTICLES.find(a => a.id === id);
    if (!article) return <div className="text-center py-20">Artikel nicht gefunden.</div>;
    
    return (
       <div className="max-w-7xl mx-auto pb-20 pt-8 px-4">
          <button onClick={() => navigate('/help')} className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">
             <ArrowLeft className="w-4 h-4" /> Zurück zur Übersicht
          </button>
          <ArticleDetail article={article} />
       </div>
    );
  }

  // View: Overview / Search
  return (
    <div className="max-w-5xl mx-auto pb-20 pt-16 px-4">
       <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter mb-6">Knowledge Base</h1>
          <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto mb-10">
             Die zentrale Datenbank für Begriffe, Konzepte und Logiken in KOSMA.
          </p>
          
          <div className="relative max-w-2xl mx-auto group">
             <div className="absolute inset-0 bg-brand-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             <div className="relative bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex items-center focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all">
                <Search className="w-6 h-6 text-gray-400 ml-4" />
                <input 
                   type="text" 
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                   placeholder="Suche nach Begriffen (z.B. 'Magic Link', 'Markup')..." 
                   className="w-full p-4 outline-none text-lg bg-transparent font-medium"
                />
             </div>
             
             {/* Search Dropdown */}
             {search && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20">
                   {searchResults.length > 0 ? (
                      <div className="divide-y divide-gray-50">
                         {searchResults.map(res => (
                            <Link to={`/help/${res.id}`} key={res.id} className="block p-4 hover:bg-gray-50 transition-colors">
                               <div className="font-bold text-gray-900">{res.title}</div>
                               <div className="text-sm text-gray-500 truncate">{res.content.definition}</div>
                            </Link>
                         ))}
                      </div>
                   ) : (
                      <div className="p-8 text-center text-gray-400 italic">Keine Treffer.</div>
                   )}
                </div>
             )}
          </div>
       </div>

       {/* Categories */}
       {!search && (
          <div className="space-y-12">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {KNOWLEDGE_CATEGORIES.map(cat => {
                   const Icon = DOC_ICONS[cat.iconKey] || BookOpen;
                   return (
                      <div key={cat.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col h-full">
                         <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 mb-6">
                            <Icon className="w-6 h-6" />
                         </div>
                         <h3 className="text-xl font-black text-gray-900 mb-2">{cat.title}</h3>
                         <p className="text-sm text-gray-500 mb-6 flex-1">{cat.description}</p>
                         
                         <div className="space-y-3">
                            {KNOWLEDGE_ARTICLES.filter(a => a.categoryId === cat.id).map(art => (
                               <Link to={`/help/${art.id}`} key={art.id} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-brand-600 transition-colors group">
                                  <CornerDownRight className="w-4 h-4 text-gray-300 group-hover:text-brand-400" />
                                  {art.title}
                               </Link>
                            ))}
                         </div>
                      </div>
                   );
                })}
             </div>
          </div>
       )}
    </div>
  );
};

export const KnowledgeBasePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const Wrapper = isAuthenticated ? DashboardLayout : MarketingLayout;
  return <Wrapper><KnowledgeBaseContent /></Wrapper>;
};
