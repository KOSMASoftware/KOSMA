
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, BookOpen, ArrowLeft, ExternalLink,
  CornerDownRight, Hash, GraduationCap, ChevronRight,
  LayoutGrid, Info, Eye, Sliders, PlusCircle, Layout, RefreshCw, Home, Layers, FileText
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
const CATEGORY_COLORS: Record<string, string> = {
  'budgeting-general-ui-screen-gliederung': '#0093D5', // Brand Blue
  'project-manager-projects': '#305583',             // Dark Blue
  'financing-general-ui': '#07929E',                 // Teal
  'cash-flow-general-ui': '#FD7A36',                 // Orange
  'cost-control-general-ui': '#7A62D2',              // Purple
  'admin-project-management': '#475569',             // Slate
  'printing-sharing': '#ADB5BD',                     // Gray
  'licensing': '#F59E0B',                            // Amber
  'faq': '#10B981',                                  // Emerald
};

// --- COMPONENTS ---

// Sticky Header with Breadcrumbs & Compact Search
const StickyHeader = ({ 
  category, 
  articleTitle, 
  onSearch 
}: { 
  category: KnowledgeCategory, 
  articleTitle: string, 
  onSearch: (q: string) => void 
}) => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 mb-8 transition-all">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm overflow-hidden w-full md:w-auto">
           <button onClick={() => navigate('/help')} className="text-gray-400 hover:text-gray-900 transition-colors shrink-0">
              <Home className="w-4 h-4" />
           </button>
           <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
           <Link to={`/help/${category.id}`} className="font-bold text-gray-500 hover:text-brand-500 transition-colors whitespace-nowrap">
              {category.title}
           </Link>
           <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
           <span className="font-bold text-gray-900 truncate max-w-[200px] md:max-w-xs" title={articleTitle}>
              {articleTitle}
           </span>
        </div>

        {/* Compact Search */}
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
           <input 
             type="text" 
             placeholder="Search KB..." 
             value={searchValue}
             onChange={handleSearchChange}
             className="w-full bg-gray-100 border border-transparent focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-full py-1.5 pl-9 pr-4 text-sm font-medium outline-none transition-all"
           />
        </div>
      </div>
    </div>
  );
};

const ArticleDetail = ({ article, category }: { article: KnowledgeArticle, category: KnowledgeCategory }) => {
  const navigate = useNavigate();
  const [localSearch, setLocalSearch] = useState('');

  // Handle local search redirection logic if needed, or just highlight
  // For now, let's allow the sticky header to redirect back to main search if typed
  const handleHeaderSearch = (q: string) => {
     if (q.length > 2) {
        // Redirect to main overview with query
        // We use state passing or URL params. 
        // Simple approach: Navigate to root with hash or query
        // navigate(`/help?q=${q}`); // Implementation detail for later
     }
  };

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

  // Find siblings (articles in the same section)
  const siblings = useMemo(() => {
      const section = category.sections.find(s => s.articles.some(a => a.id === article.id));
      if (!section) return [];
      return section.articles.filter(a => a.id !== article.id);
  }, [article, category]);

  return (
    <div className="pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <StickyHeader 
          category={category} 
          articleTitle={article.title} 
          onSearch={(q) => setLocalSearch(q)} // Wired to local state for now, could act as global filter
       />

       {/* Search Results Overlay (If typing in Sticky Header) */}
       {localSearch && (
          <div className="max-w-5xl mx-auto px-4 mb-8">
             <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Search Results</p>
                {KB_DATA.flatMap(c => c.sections.flatMap(s => s.articles)).filter(a => a.title.toLowerCase().includes(localSearch.toLowerCase())).slice(0, 5).map(res => (
                   <Link key={res.id} to={`/help/article/${res.id}`} onClick={() => setLocalSearch('')} className="block py-2 border-b border-gray-50 last:border-0 hover:text-brand-500 font-medium">
                      {res.title}
                   </Link>
                ))}
                {localSearch.length > 0 && <div className="pt-2 text-center"><button onClick={() => navigate('/help')} className="text-xs text-brand-500 font-bold">Go to full search</button></div>}
             </div>
          </div>
       )}

       <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-brand-500 mb-4">
              <BookOpen className="w-4 h-4" /> {category.title}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-8 tracking-tight leading-tight">{article.title}</h1>

          {/* Definition Box */}
          <div className="text-lg md:text-xl leading-relaxed text-gray-600 mb-12 font-medium border-l-4 border-brand-500 pl-6 py-2 bg-gray-50/50 rounded-r-xl">
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

              {/* Sidebar */}
              <div className="space-y-8">
                {/* 1. Context Navigation (Siblings) */}
                {siblings.length > 0 && (
                    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                       <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Layers className="w-4 h-4" /> In this section
                       </h3>
                       <ul className="space-y-3">
                          {siblings.map(sib => (
                             <li key={sib.id}>
                                <Link to={`/help/article/${sib.id}`} className="flex items-start gap-2 text-sm font-bold text-gray-600 hover:text-brand-500 transition-colors group">
                                   <CornerDownRight className="w-4 h-4 text-gray-300 group-hover:text-brand-300 mt-0.5 shrink-0" />
                                   <span className="leading-tight">{sib.title}</span>
                                </Link>
                             </li>
                          ))}
                       </ul>
                    </div>
                )}

                {/* 2. Related Learning */}
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
                
                {/* 3. Synonyms */}
                {article.synonyms && article.synonyms.length > 0 && (
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
             
             // Hide empty sections to keep it clean
             if (section.articles.length === 0) return null;
             
             return (
               <div key={section.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
                     <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400">
                        <SectionIcon className="w-5 h-5" />
                     </div>
                     <h2 className="text-lg font-black text-gray-900 uppercase tracking-wide">{section.title}</h2>
                  </div>
                  
                  <div className="p-2">
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
                  </div>
               </div>
             );
          })}
       </div>
    </div>
  );
};

// --- LEGEND COMPONENT ---
const GuideLegend = () => (
  <div className="max-w-4xl mx-auto bg-blue-50/50 rounded-2xl p-6 border border-blue-100 mb-12 animate-in fade-in slide-in-from-top-2">
     <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
        <div className="shrink-0 flex items-center gap-3">
           <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Info className="w-5 h-5" />
           </div>
           <div>
              <h4 className="font-bold text-blue-900 text-sm">Understanding the Screen</h4>
              <p className="text-xs text-blue-700/80 font-medium">We break down every module into these actions:</p>
           </div>
        </div>
        
        <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-400" />
              <div className="flex flex-col">
                 <span className="text-xs font-black uppercase text-gray-900">Read</span>
                 <span className="text-[10px] text-gray-500 font-medium leading-none">View values</span>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-gray-400" />
              <div className="flex flex-col">
                 <span className="text-xs font-black uppercase text-gray-900">Change</span>
                 <span className="text-[10px] text-gray-500 font-medium leading-none">Adjust inputs</span>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-gray-400" />
              <div className="flex flex-col">
                 <span className="text-xs font-black uppercase text-gray-900">Create</span>
                 <span className="text-[10px] text-gray-500 font-medium leading-none">Add items</span>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <Layout className="w-4 h-4 text-gray-400" />
              <div className="flex flex-col">
                 <span className="text-xs font-black uppercase text-gray-900">Navigate</span>
                 <span className="text-[10px] text-gray-500 font-medium leading-none">Switch views</span>
              </div>
           </div>
        </div>
     </div>
  </div>
);

// --- MAIN CONTENT SWITCHER ---

const KnowledgeBaseContent: React.FC = () => {
  // Routes: 
  // /help -> overview
  // /help/:id -> category detail
  // /help/article/:articleId -> article detail
  
  const { id, articleId } = useParams(); 
  const location = window.location.hash; 
  const [search, setSearch] = useState('');

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

  // ROUTE: Article Detail (Matched via new route or legacy hash logic)
  // We prefer useParams from the new route, but keep hash fallback just in case
  const targetArticleId = articleId || (location.includes('/help/article/') ? location.split('/help/article/')[1]?.split('?')[0] : null);

  if (targetArticleId) {
     const match = findArticleById(targetArticleId);
     if (match) return <ArticleDetail article={match.article} category={match.category} />;
     return <div className="p-20 text-center text-gray-400">Article not found.</div>;
  }

  // ROUTE: Category Detail
  if (id) {
     const category = KB_DATA.find(c => c.id === id);
     if (category) return <CategoryDetail category={category} />;
  }

  // ROUTE: Overview (Dashboard)
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

       {/* LEGEND BLOCK */}
       {!search && <GuideLegend />}

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
                               if (sec.articles.length === 0) return null; // Hide empty from preview
                               
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
