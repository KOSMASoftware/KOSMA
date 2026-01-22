
import { HelpMedia } from './taxonomy';

// --- NEW STRUCTURE TYPES ---

export interface KnowledgeSectionContent {
  heading: string;
  body: string; // Markdown-like, supports [[kb:id]] and [[learn:id]]
  media?: HelpMedia;
  type?: 'definition' | 'example' | 'technical';
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  synonyms?: string[]; 
  relatedLearningIds?: string[];
  content: {
    definition: string;
    sections: KnowledgeSectionContent[];
  };
}

export interface KnowledgeSection {
  id: string; // internal id for the section (e.g., 'read-understand')
  title: string; // e.g. "Read / Understand"
  iconKey: string; // e.g. "Eye"
  articles: KnowledgeArticle[];
}

export interface KnowledgeCategory {
  id: string;
  title: string;
  iconKey: string;
  description: string;
  sections: KnowledgeSection[];
}

// --- STANDARD SECTIONS TEMPLATE ---
// Helper to keep IDs consistent across categories
const getStandardSections = (): KnowledgeSection[] => [
  { id: 'read', title: 'Read / Understand', iconKey: 'Eye', articles: [] },
  { id: 'change', title: 'Change / Control', iconKey: 'Sliders', articles: [] },
  { id: 'create', title: 'Create / Manage', iconKey: 'PlusCircle', articles: [] },
  { id: 'navigate', title: 'Navigate / Views', iconKey: 'Layout', articles: [] },
  { id: 'share', title: 'Share / Sync', iconKey: 'RefreshCw', articles: [] } // Alternativ Share2
];

export const KB_DATA: KnowledgeCategory[] = [
  { 
    id: 'kb-budgeting', 
    title: 'Budgeting', 
    iconKey: 'Calculator', 
    description: 'General UI, Accounts & Details',
    sections: getStandardSections()
  },
  { 
    id: 'kb-projects', 
    title: 'Project Manager', 
    iconKey: 'Film', 
    description: 'Projects & Global Settings',
    sections: getStandardSections()
  },
  { 
    id: 'kb-financing', 
    title: 'Financing', 
    iconKey: 'PieChart', 
    description: 'Financing Plans & Sources',
    sections: getStandardSections()
  },
  { 
    id: 'kb-cashflow', 
    title: 'Cash Flow', 
    iconKey: 'Coins', 
    description: 'Liquidity & Milestones',
    sections: getStandardSections()
  },
  { 
    id: 'kb-costcontrol', 
    title: 'Cost Control', 
    iconKey: 'TrendingUp', 
    description: 'Reporting & Reconciliation',
    sections: getStandardSections()
  },
  { 
    id: 'kb-admin', 
    title: 'Admin', 
    iconKey: 'ShieldCheck', 
    description: 'Project Management & Rights',
    sections: getStandardSections()
  },
  { 
    id: 'kb-printing', 
    title: 'Printing & Sharing', 
    iconKey: 'Printer', 
    description: 'Exports, PDF & Teamwork',
    sections: getStandardSections()
  },
  { 
    id: 'kb-licensing', 
    title: 'Licensing', 
    iconKey: 'CreditCard', // Mapped in layout or Generic
    description: 'Plans, Billing & Trials',
    sections: getStandardSections()
  },
  { 
    id: 'kb-faq', 
    title: 'FAQ', 
    iconKey: 'CircleHelp', 
    description: 'Common questions',
    sections: getStandardSections()
  }
];

// --- HELPER FOR SMART LINKS ---
// Flattens the structure to find an article by ID efficiently
export const findArticleById = (id: string): { article: KnowledgeArticle, category: KnowledgeCategory } | null => {
  for (const cat of KB_DATA) {
    for (const sec of cat.sections) {
      const found = sec.articles.find(a => a.id === id);
      if (found) return { article: found, category: cat };
    }
  }
  return null;
};
