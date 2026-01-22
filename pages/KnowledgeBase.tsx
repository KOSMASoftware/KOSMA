
import React, { useState, useMemo } from 'react';
import { 
  Search, BookOpen, ArrowLeft, ExternalLink,
  CornerDownRight, Hash, GraduationCap, ChevronRight,
  LayoutGrid
} from 'lucide-react';
import { KB_DATA, findArticleById, KnowledgeArticle, KnowledgeCategory } from '../data/knowledge-data';
import { LEARNING_DATA } from '../data/learning-data';
import { DOC_ICONS } from '../data/taxonomy';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout as DashboardLayout } from '../components/Layout';
import { MarketingLayout } from '../components/layout/MarketingLayout';
import { SmartLink } from '../components/SmartLink';
import { Card } from '../components/ui/Card';

// --- COLOR MAPPING ---
// Consistently assign colors to categories based on ID
const CATEGORY_COLORS: Record<string, string> = {
  'kb-budgeting': '#0093D5',      // Brand Blue
  'kb-projects': '#305583',       // Dark Blue
  'kb-financing': '#07929E',      // Teal
  'kb-cashflow': '#FD7A36',       // Orange
  'kb-costcontrol': '#7A62D2',    // Purple
  'kb-admin': '#475569',          // Slate
  'kb-printing': '#ADB5BD',       // Gray
  'kb-licensing': '#F59E0B',      // Amber
  'kb-faq': '#10B981',            // Emerald
};

// --- COMPONENTS ---

const ArticleDetail = ({ article, category }: { article: KnowledgeArticle, category: KnowledgeCategory }) => {
  const navigate = useNavigate();
  
  const relatedLearning = useMemo(() => {
     const results: { id: string, title: string, category: string }[] = [];
     if (!article.relatedLearningIds) return results;
     
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
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
       <button onClick={() => navigate(`/help/${category.id}`)} className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-brand-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to {category.title}
       </button>

       <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-brand-500 mb-4">
          <BookOpen className="w-4 h-4" /> {category.title}
       </div>
       <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 tracking-tight">{article.title}</h1>

       {/* Definition Box */}
       <div className="text-xl md:text-2xl leading-relaxed text-gray-600 mb-12 font-medium border-l-4 border-brand-500 pl-6 py-2 bg-gray-50/50 rounded-r-xl">
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
                      <GraduationCap className="w-4 h-4" /> Apply this knowledge
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
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                   <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-4">Synonyms</h3>
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

const CategoryDetail = ({ category }: { category: KnowledgeCategory }) => {
  const navigate = useNavigate();
  const cardColor = CATEGORY_COLORS[category.id] || '#0093D5';
  const Icon = DOC_ICONS[category.iconKey] || BookOpen;

  return (
    <div className="max-w-6xl mx-auto pb-20 pt-8 px-4 animate-in fade-in slide-in-from-right-4 duration-500">
       <button onClick={() => navigate('/help')} className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Knowledge Base
       </button>

       {/* Category Header */}
       <div className="flex items-center gap-6 mb-12">
          <div className="w-20 h-20 bg-white rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
             <Icon className="w-10 h-10" style={{ color: cardColor }} />
          </div>
          <div>
             <h1 className="text-4xl font-black text-gray-900 tracking-tight">{category.title}</h1>
             <p className="text-gray-500 font-medium text-lg">{category.description}</p>
          </div>
       </div>

       {/* Sections Grid */}
       <div className="space-y-12">
          {category.sections.map(section => {
             const SectionIcon = DOC_ICONS[section.iconKey] || LayoutGrid;
             // Only show section if it has articles OR if we want to show empty structure (user requested empty structure to start)
             // We show empty sections to indicate scope.
             
             return (
               <div key={section.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
                     <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400">
                        <SectionIcon className="w-5 h-5" />
                     </div>
                     <h2 className="text-lg font-black text-gray-900 uppercase tracking-wide">{section.title}</h2>
                  </div>
                  
                  <div className="p-2">
                     {section.articles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                           {section.articles.map(article => (
                              <Link 
                                key={article.id} 
                                to={`/help/article/${article.id}`} 
                                className="group flex items-start gap-4 p-6 rounded-3xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                              >
                                 <div className="mt-1">
                                    <CornerDownRight className="w-5 h-5 text-gray-300 group-hover:text-brand-500 transition-colors" />
                                 </div>
                                 <div>
                                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-brand-600 transition-colors mb-1">{article.title}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2">{article.content.definition}</p>
                                 </div>
                              </Link>
                           ))}
                        </div>
                     ) : (
                        <div className="p-8 text-center text-gray-400 italic text-sm">
                           No articles in this section yet.
                        </div>
                     )}
                  </div>
               </div>
             );
          })}
       </div>
    </div>
  );
};

// --- MAIN CONTENT SWITCHER ---

const KnowledgeBaseContent: React.FC = () => {
  const { id } = useParams(); // Can be category ID or 'article/:articleId' logic needs handling
  const location = window.location.hash; // We are using HashRouter in App.tsx
  const [search, setSearch] = useState('');

  // Handle Routing manually because standard Routes are tricky with strict props
  // URL Pattern: 
  // /help -> Overview
  // /help/kb-budgeting -> Category Detail
  // /help/article/kb-markups -> Article Detail

  // Re-parse params for custom sub-routes
  const isArticle = location.includes('/help/article/');
  const articleId = isArticle ? location.split('/help/article/')[1]?.split('?')[0] : null;
  
  // Search Logic
  const searchResults = useMemo(() => {
    if (!search) return [];
    const lower = search.toLowerCase();
    const results: { article: KnowledgeArticle, category: KnowledgeCategory }[] = [];
    
    KB_DATA.forEach(cat => {
       cat.sections.forEach(sec => {
          sec.articles.forEach(art => {
             if (
               art.title.toLowerCase().includes(lower) || 
               art.synonyms?.some(s => s.toLowerCase().includes(lower)) ||
               art.content.definition.toLowerCase().includes(lower)
             ) {
                results.push({ article: art, category: cat });
             }
          });
       });
    });
    return results;
  }, [search]);

  // RENDER: Article Detail
  if (isArticle && articleId) {
     const match = findArticleById(articleId);
     if (match) return <ArticleDetail article={match.article} category={match.category} />;
     return <div className="p-20 text-center text-gray-400">Article not found.</div>;
  }

  // RENDER: Category Detail
  if (id && !isArticle) {
     const category = KB_DATA.find(c => c.id === id);
     if (category) return <CategoryDetail category={category} />;
  }

  // RENDER: Overview (Dashboard)
  return (
    <div className="max-w-6xl mx-auto pb-20 pt-16 px-4">
       <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter mb-6">Knowledge Base</h1>
          <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto mb-10">
             The central reference for terms, concepts, and logic in KOSMA.
          </p>
          
          <div className="relative max-w-2xl mx-auto group z-20">
             <div className="absolute inset-0 bg-brand-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             <div className="relative bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex items-center focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all">
                <Search className="w-6 h-6 text-gray-400 ml-4" />
                <input 
                   type="text" 
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                   placeholder="Search for terms (e.g. 'Magic Link', 'Markup')..." 
                   className="w-full p-4 outline-none text-lg bg-transparent font-medium"
                />
             </div>
             
             {/* Search Dropdown */}
             {search && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-30">
                   {searchResults.length > 0 ? (
                      <div className="divide-y divide-gray-50">
                         {searchResults.map(res => (
                            <Link to={`/help/article/${res.article.id}`} key={res.article.id} className="block p-4 hover:bg-gray-50 transition-colors">
                               <div className="font-bold text-gray-900">{res.article.title}</div>
                               <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{res.category.title}</div>
                               <div className="text-sm text-gray-500 truncate">{res.article.content.definition}</div>
                            </Link>
                         ))}
                      </div>
                   ) : (
                      <div className="p-8 text-center text-gray-400 italic">No results.</div>
                   )}
                </div>
             )}
          </div>
       </div>

       {/* Category Tiles */}
       {!search && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {KB_DATA.map(cat => {
                const Icon = DOC_ICONS[cat.iconKey] || BookOpen;
                const cardColor = CATEGORY_COLORS[cat.id] || '#0093D5';
                
                return (
                   <Card 
                     key={cat.id} 
                     color={cardColor}
                     interactive
                     enableLedEffect={true}
                     className="group h-full items-start"
                     onClick={() => window.location.hash = `/help/${cat.id}`}
                   >
                      <div className="flex items-start justify-between w-full mb-6">
                         <div className="p-3 bg-gray-50 rounded-2xl text-gray-900 group-hover:bg-gray-900 group-hover:text-white transition-colors duration-300">
                            <Icon className="w-8 h-8" />
                         </div>
                         <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-500 transition-colors" />
                      </div>
                      
                      <h3 
                         className="text-2xl font-black mb-2"
                         style={{ color: cardColor }}
                      >{cat.title}</h3>
                      
                      <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">{cat.description}</p>
                      
                      {/* Rubriken Preview (The Content Map Concept) */}
                      <div className="w-full border-t border-gray-100 pt-6 mt-auto">
                         <div className="flex flex-wrap gap-2">
                            {cat.sections.map(sec => {
                               const SecIcon = DOC_ICONS[sec.iconKey] || LayoutGrid;
                               return (
                                 <span key={sec.id} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wide border border-gray-100 group-hover:border-gray-200 transition-colors">
                                    <SecIcon className="w-3 h-3" />
                                    {sec.title.split('/')[0].trim()} 
                                 </span>
                               );
                            })}
                         </div>
                      </div>
                   </Card>
                );
             })}
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
