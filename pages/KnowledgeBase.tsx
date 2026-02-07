import React, { useState, useMemo } from 'react';
import { 
  Search, BookOpen, ArrowLeft, ChevronRight, 
  Rocket, Calculator, PieChart, Coins, TrendingUp, Printer, Settings,
  Hash, ExternalLink, CornerDownRight, FileText, AlertTriangle, Lightbulb, Info, ListOrdered
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout as DashboardLayout } from '../components/Layout';
import { MarketingLayout } from '../components/layout/MarketingLayout';
import { KB_DATA, findArticleById, KnowledgeArticle, KnowledgeCategory } from '../data/knowledge-data';
import { SmartLink } from '../components/SmartLink';
import { Card } from '../components/ui/Card';
import { supabase } from '../lib/supabaseClient';
import { Input } from '../components/ui/Input';

// --- ICONS MAPPING ---
const CATEGORY_ICONS: Record<string, any> = {
  'Rocket': Rocket,
  'Calculator': Calculator,
  'PieChart': PieChart,
  'Coins': Coins,
  'TrendingUp': TrendingUp,
  'Printer': Printer,
  'Settings': Settings,
  'BookOpen': BookOpen
};

// --- CONFIGURATION: THE 7 MAIN CATEGORIES ---
// This maps the cleaner URL slugs to the data/logic
const KB_STRUCTURE = [
  {
    slug: 'first-steps',
    title: 'First Steps',
    description: 'Account setup, licensing, and project basics.',
    icon: 'Rocket',
    color: '#3B82F6', // Blue
    dataIds: ['project-manager-projects', 'licensing'], // Pulls articles from these old categories
    groups: [
      { title: 'Project Basics', match: ['projects list', 'metadata', 'sort'] },
      { title: 'Create & Open', match: ['create', 'open', 'rename', 'archive'] },
      { title: 'Access & Sharing', match: ['permission', 'sync'] },
      { title: 'Licensing & Billing', match: ['plan', 'billing', 'subscription'] }
    ]
  },
  {
    slug: 'budgeting',
    title: 'Budgeting',
    description: 'Accounts, fringes, formulas, and structure.',
    icon: 'Calculator',
    color: '#F59E0B', // Amber
    dataIds: ['budgeting-general-ui-screen-gliederung'],
    groups: [
      { title: 'Overview & Totals', match: ['grand total', 'grid values', 'search'] },
      { title: 'Display & Columns', match: ['display currency', 'column', 'expand'] },
      { title: 'Input Modes', match: ['numbers vs', 'fringe', 'filter'] },
      { title: 'Structure', match: ['add category', 'add group', 'add account', 'subaccount'] },
      { title: 'Row Actions', match: ['delete', 'deactivate', 'renumber', 'duplicate'] },
      { title: 'Navigation', match: ['navigation', 'dashboard', 'shortcut'] }
    ]
  },
  {
    slug: 'financing',
    title: 'Financing',
    description: 'Financing plans, sources, and installments.',
    icon: 'PieChart',
    color: '#07929E', // Teal
    dataIds: ['financing-general-ui'],
    groups: [
      { title: 'Overview', match: ['grid values', 'totals', 'status', 'installments'] },
      { title: 'Display & Filters', match: ['display', 'column', 'filter'] },
      { title: 'Plan Actions', match: ['new financing', 'copy', 'delete'] },
      { title: 'Views', match: ['navigation', 'dashboard', 'timeline'] }
    ]
  },
  {
    slug: 'cashflow',
    title: 'Cashflow',
    description: 'Liquidity planning, timeline, and milestones.',
    icon: 'Coins',
    color: '#16A34A', // Green
    dataIds: ['cash-flow-general-ui'],
    groups: [
      { title: 'Overview', match: ['grid', 'rows', 'totals'] },
      { title: 'Timeline', match: ['timeline', 'scale'] },
      { title: 'Plan Actions', match: ['new cash', 'copy', 'delete'] },
      { title: 'Milestones', match: ['milestone'] }
    ]
  },
  {
    slug: 'cost-control',
    title: 'Cost Control',
    description: 'Actuals, deviations, and forecasts.',
    icon: 'TrendingUp',
    color: '#9333EA', // Purple
    dataIds: ['cost-control-general-ui'],
    groups: [
      { title: 'Overview & Indicators', match: ['grid', 'totals', 'prediction', 'items area'] },
      { title: 'Display & Toggles', match: ['display', 'toggle', 'column', 'consolidate'] },
      { title: 'Plan Actions', match: ['new cost', 'copy', 'delete', 'add cost'] }
    ]
  },
  {
    slug: 'share-print',
    title: 'Share & Print',
    description: 'Exports, PDF generation, and data syncing.',
    icon: 'Printer',
    color: '#64748B', // Slate
    dataIds: ['printing-sharing'],
    groups: [
      { title: 'Export Setup', match: ['options', 'selection', 'format', 'paper'] },
      { title: 'Actions', match: ['export', 'print', 'save', 'return', 'share'] }
    ]
  },
  {
    slug: 'project-admin',
    title: 'Project Administration',
    description: 'Team members, roles, and access rights.',
    icon: 'Settings',
    color: '#475569', // Gray
    dataIds: ['admin-project-management'],
    groups: [
      { title: 'People & Roles', match: ['members', 'status'] },
      { title: 'Sharing Controls', match: ['share mode', 'settings', 'revoke'] },
      { title: 'Member Actions', match: ['invite', 'remove'] },
      { title: 'Navigation', match: ['back'] }
    ]
  }
];

// --- COMPONENTS ---

// 1. LANDING PAGE
const KBLanding = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Flatten articles for search
  const allArticles = useMemo(() => {
    return KB_DATA.flatMap(cat => 
      cat.sections.flatMap(sec => 
        sec.articles.map(art => ({ ...art, categoryTitle: cat.title }))
      )
    );
  }, []);

  const searchResults = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return allArticles.filter(a => 
      a.title.toLowerCase().includes(q) || 
      a.synonyms?.some(s => s.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [search, allArticles]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">Knowledge Base</h1>
        
        {/* Search Bar - Standardized to Input Primitive */}
        <div className="relative max-w-2xl mx-auto group z-20">
           <div className="absolute inset-0 bg-gray-200/50 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
           <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input 
                 placeholder="Search definitions, fields, concepts..." 
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 className="pl-10 h-10 text-sm shadow-sm border-gray-200"
              />
           </div>
           
           {/* Search Results Dropdown */}
           {search && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-30">
                 {searchResults.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                       {searchResults.map(res => (
                          <Link to={`/help/article/${res.id}`} key={res.id} className="block p-4 hover:bg-gray-50 transition-colors">
                             <div className="font-bold text-gray-900">{res.title}</div>
                             <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">{res.categoryTitle}</div>
                          </Link>
                       ))}
                    </div>
                 ) : (
                    <div className="p-6 text-center text-gray-400 italic font-medium">No results found.</div>
                 )}
              </div>
           )}
        </div>
      </div>

      {/* The 7 Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {KB_STRUCTURE.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.icon] || BookOpen;
          return (
            <Link 
              key={cat.slug} 
              to={`/help/${cat.slug}`}
              className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-start"
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors"
                style={{ backgroundColor: `${cat.color}15`, color: cat.color }} // 15 = low opacity hex
              >
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                {cat.title}
              </h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                {cat.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

// 2. CATEGORY DETAIL (Directory Style)
const KBCategory = ({ slug }: { slug: string }) => {
  const config = KB_STRUCTURE.find(c => c.slug === slug);
  const navigate = useNavigate();

  // If slug is invalid, redirect to landing
  if (!config) {
    React.useEffect(() => { navigate('/help'); }, [navigate]);
    return null;
  }

  const Icon = CATEGORY_ICONS[config.icon] || BookOpen;

  // DATA MAPPING LOGIC
  const categorizedArticles = useMemo(() => {
    // 1. Fetch relevant articles from KB_DATA
    const rawArticles: KnowledgeArticle[] = [];
    KB_DATA.forEach(kbCat => {
        if (config.dataIds.includes(kbCat.id)) {
            kbCat.sections.forEach(sec => {
                rawArticles.push(...sec.articles);
            });
        }
    });

    // 2. Distribute into groups
    const groupsWithArticles = config.groups.map(grp => ({
        ...grp,
        articles: [] as KnowledgeArticle[]
    }));

    const leftoverArticles: KnowledgeArticle[] = [];

    rawArticles.forEach(art => {
        let placed = false;
        // Try to match with group keywords
        for (const grp of groupsWithArticles) {
            const lowerTitle = art.title.toLowerCase();
            const lowerSynonyms = (art.synonyms || []).join(' ').toLowerCase();
            
            if (grp.match.some(keyword => lowerTitle.includes(keyword) || lowerSynonyms.includes(keyword))) {
                grp.articles.push(art);
                placed = true;
                break; 
            }
        }
        if (!placed) leftoverArticles.push(art);
    });

    // Add "Other" group if needed
    if (leftoverArticles.length > 0) {
        groupsWithArticles.push({ title: 'Other Topics', match: [], articles: leftoverArticles });
    }

    return groupsWithArticles.filter(g => g.articles.length > 0);
  }, [config]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="mb-12">
        <Link to="/help" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors mb-8">
           <ArrowLeft className="w-4 h-4" /> Back to Knowledge Base
        </Link>
        
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 bg-white">
              <Icon className="w-8 h-8" style={{ color: config.color }} />
           </div>
           <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">{config.title}</h1>
              <p className="text-gray-500 font-medium mt-1">{config.description}</p>
           </div>
        </div>
      </div>

      {/* Directory Grid (Masonry-ish) */}
      <div className="columns-1 md:columns-2 gap-6 space-y-6">
         {categorizedArticles.map((group, idx) => (
            <div key={idx} className="break-inside-avoid bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 pb-2 border-b border-gray-100">
                   {group.title}
                </h3>
                <ul className="space-y-3">
                   {group.articles.map(article => (
                      <li key={article.id}>
                         <Link 
                           to={`/help/article/${article.id}`}
                           className="group flex items-start gap-3 hover:bg-gray-50 -mx-3 p-3 rounded-xl transition-colors"
                         >
                            <div className="mt-1 text-gray-300 group-hover:text-brand-500 transition-colors">
                               <CornerDownRight className="w-4 h-4" />
                            </div>
                            <div>
                               <div className="text-sm font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                                  {article.title}
                               </div>
                               <div className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                                  {article.content.definition}
                               </div>
                            </div>
                         </Link>
                      </li>
                   ))}
                </ul>
            </div>
         ))}
      </div>
    </div>
  );
};

// 3. ARTICLE DETAIL
const KBArticle = ({ articleId }: { articleId: string }) => {
  const match = findArticleById(articleId);
  const navigate = useNavigate();

  if (!match) {
     return <div className="p-8 text-center text-gray-400">Article not found.</div>;
  }

  const { article, category } = match;

  // Find parent config to link back correctly
  const parentConfig = KB_STRUCTURE.find(c => c.dataIds.includes(category.id)) || KB_STRUCTURE[0];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
       {/* Breadcrumb Nav */}
       <div className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-8 overflow-hidden">
          <Link to="/help" className="hover:text-gray-900 transition-colors">Knowledge Base</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/help/${parentConfig.slug}`} className="hover:text-gray-900 transition-colors whitespace-nowrap">
             {parentConfig.title}
          </Link>
       </div>

       {/* Article Header */}
       <div className="mb-12 border-b border-gray-100 pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest mb-6">
             <FileText className="w-3 h-3" /> Definition
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter mb-6 leading-tight">
             {article.title}
          </h1>
          <div className="text-lg md:text-xl font-medium text-gray-600 leading-relaxed bg-brand-50/30 p-6 rounded-2xl border border-brand-100/50">
             {article.content.definition}
          </div>
       </div>

       {/* Content Sections */}
       <div className="space-y-12">
          {article.content.sections.map((sec, idx) => {
             // --- RENDER LOGIC BASED ON TYPE ---
             
             // 1. Process (Steps)
             if (sec.type === 'process') {
               const steps = sec.body.split('\n').filter(s => s.trim().length > 0);
               return (
                 <div key={idx} className="group">
                    <h3 className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-6">
                       <div className="p-1.5 rounded-lg bg-gray-100 text-gray-400"><ListOrdered className="w-4 h-4" /></div>
                       {sec.heading}
                    </h3>
                    <div className="space-y-4">
                       {steps.map((step, sIdx) => (
                          <div key={sIdx} className="flex gap-4">
                             <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs mt-0.5">
                                {sIdx + 1}
                             </div>
                             <div className="text-gray-600 font-medium leading-relaxed">
                                <SmartLink text={step} />
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
               );
             }

             // 2. Callouts (Warning, Tip, Note)
             if (['warning', 'tip', 'note'].includes(sec.type || '')) {
               const styles = {
                 warning: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-900', icon: AlertTriangle, iconColor: 'text-amber-500' },
                 tip: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-900', icon: Lightbulb, iconColor: 'text-emerald-500' },
                 note: { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-700', icon: Info, iconColor: 'text-slate-400' }
               };
               // @ts-ignore
               const style = styles[sec.type];
               const Icon = style.icon;

               return (
                 <div key={idx} className={`p-6 rounded-2xl border ${style.bg} ${style.border} flex gap-4`}>
                    <div className={`mt-0.5 ${style.iconColor}`}><Icon className="w-5 h-5" /></div>
                    <div>
                       <h4 className={`font-bold text-sm mb-1 uppercase tracking-wider opacity-80 ${style.text}`}>{sec.heading}</h4>
                       <p className={`text-sm font-medium leading-relaxed ${style.text}`}><SmartLink text={sec.body} /></p>
                    </div>
                 </div>
               );
             }

             // 3. Example & Standard
             return (
               <div key={idx} className="group">
                  <h3 className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-4">
                     <div className="p-1.5 rounded-lg bg-gray-100 text-gray-400">
                        <Hash className="w-4 h-4" />
                     </div>
                     {sec.heading}
                  </h3>
                  <div className={`prose prose-slate max-w-none text-gray-600 font-medium leading-relaxed ${
                     sec.type === 'example' ? 'bg-gray-50 p-6 rounded-2xl border border-gray-100 text-sm' : ''
                  }`}>
                     <SmartLink text={sec.body} />
                  </div>
                  
                  {sec.media && (
                     <div className="mt-6 rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
                        <img 
                          src={supabase.storage.from(sec.media.bucket).getPublicUrl(sec.media.path).data.publicUrl} 
                          alt={sec.media.alt || 'Visual'}
                          className="w-full h-auto block"
                        />
                     </div>
                  )}
               </div>
             );
          })}
       </div>

       {/* Footer */}
       <div className="mt-16 pt-8 border-t border-gray-100">
          <Link to={`/help/${parentConfig.slug}`} className="inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 hover:underline">
             <ArrowLeft className="w-4 h-4" /> Back to {parentConfig.title} overview
          </Link>
       </div>
    </div>
  );
};

// --- MAIN CONTROLLER ---
const KnowledgeBaseContent: React.FC = () => {
  const { id, articleId } = useParams(); // 'id' in route definition matches ':id' which we use for category slug

  // Case 1: Article Detail
  if (articleId) {
     return <KBArticle articleId={articleId} />;
  }

  // Case 2: Category Listing
  if (id && KB_STRUCTURE.some(c => c.slug === id)) {
     return <KBCategory slug={id} />;
  }

  // Case 3: Landing Page
  return <KBLanding />;
};

export const KnowledgeBasePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const Wrapper = isAuthenticated ? DashboardLayout : MarketingLayout;
  return <Wrapper><KnowledgeBaseContent /></Wrapper>;
};