
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

// --- HELPER TO GENERATE MOCK ARTICLES FROM STRINGS ---
const createArticles = (items: string[]): KnowledgeArticle[] => {
  return items.map(item => ({
    id: item.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    title: item,
    content: {
      definition: `Detailed explanation and usage guide for "${item}".`,
      sections: []
    }
  }));
};

export const KB_DATA: KnowledgeCategory[] = [
  {
    id: "budgeting-general-ui-screen-gliederung",
    title: "Budgeting",
    iconKey: "Calculator",
    description: "General UI & Screen Structure",
    sections: [
      {
        id: "read",
        title: "Read / Understand",
        iconKey: "Eye",
        articles: createArticles([
          "Grand Total (display currency)",
          "Grid values (rows/columns)",
          "Search results (filtered Rows)"
        ])
      },
      {
        id: "change",
        title: "Change / Control",
        iconKey: "Sliders",
        articles: createArticles([
          "Display Currency Dropdown",
          "Numbers vs. Formulas Toggle",
          "Fringes/Supplements/Extra Costs Toggle",
          "Filter Toggle",
          "Additional Columns Dropdown",
          "Expand Grid / Collapse Grid"
        ])
      },
      {
        id: "create",
        title: "Create / Manage",
        iconKey: "PlusCircle",
        articles: createArticles([
          "Add Category",
          "Add Group",
          "Add Account",
          "Add Subaccount",
          "Delete Selected Element",
          "Deactivate / Activate Row",
          "Renumber Items",
          "Duplicate Dataset"
        ])
      },
      {
        id: "navigate",
        title: "Navigate / Views",
        iconKey: "Layout",
        articles: createArticles([
          "Module Navigation Bar",
          "Dashboard Button",
          "Timeline Button",
          "Markups Shortcut (pinned row)"
        ])
      },
      {
        id: "share",
        title: "Share / Sync",
        iconKey: "RefreshCw",
        articles: createArticles([
          "Share Dataset Button"
        ])
      }
    ]
  },
  {
    id: "project-manager-projects",
    title: "Project Manager",
    iconKey: "Film",
    description: "Projects & Global Settings",
    sections: [
      {
        id: "read",
        title: "Read / Understand",
        iconKey: "Eye",
        articles: createArticles([
          "Projects list (all projects)",
          "Permission column (Admin vs. Guest)",
          "Project status/metadata (e.g. modified date)",
          "Active project indicator"
        ])
      },
      {
        id: "change",
        title: "Change / Control",
        iconKey: "Sliders",
        articles: createArticles([
          "Project settings (Dialog)",
          "Sorting / filtering"
        ])
      },
      {
        id: "create",
        title: "Create / Manage",
        iconKey: "PlusCircle",
        articles: createArticles([
          "Create new project",
          "Open / Delete / Archive project",
          "Rename project"
        ])
      },
      {
        id: "navigate",
        title: "Navigate / Views",
        iconKey: "Layout",
        articles: createArticles([
          "Open project (leads to module view)"
        ])
      },
      {
        id: "share",
        title: "Share / Sync",
        iconKey: "RefreshCw",
        articles: createArticles([
          "Sync/Share indicators"
        ])
      }
    ]
  },
  {
    id: "financing-general-ui",
    title: "Financing",
    iconKey: "PieChart",
    description: "General UI",
    sections: [
      {
        id: "read",
        title: "Read / Understand",
        iconKey: "Eye",
        articles: createArticles([
          "Financing grid values (Country/Group/Fund, Amount, Currency)",
          "Status column",
          "Installments",
          "Totals/Summary"
        ])
      },
      {
        id: "change",
        title: "Change / Control",
        iconKey: "Sliders",
        articles: createArticles([
          "Display Currency dropdown",
          "Column visibility (Additional Columns)",
          "Filters / Search"
        ])
      },
      {
        id: "create",
        title: "Create / Manage",
        iconKey: "PlusCircle",
        articles: createArticles([
          "New financing plan (Dialog)",
          "Copy financing plan",
          "Delete financing plan"
        ])
      },
      {
        id: "navigate",
        title: "Navigate / Views",
        iconKey: "Layout",
        articles: createArticles([
          "Module navigation (Budgeting/Financing/Cash Flow/Cost Control)",
          "Dashboard view",
          "Timeline view"
        ])
      },
      {
        id: "share",
        title: "Share / Sync",
        iconKey: "RefreshCw",
        articles: createArticles([
          "Share dataset button"
        ])
      }
    ]
  },
  {
    id: "cash-flow-general-ui",
    title: "Cash Flow",
    iconKey: "Coins",
    description: "General UI",
    sections: [
      {
        id: "read",
        title: "Read / Understand",
        iconKey: "Eye",
        articles: createArticles([
          "Cash flow grid (intervals, totals)",
          "Income/Expense rows",
          "Totals/summary",
          "Timeline markers"
        ])
      },
      {
        id: "change",
        title: "Change / Control",
        iconKey: "Sliders",
        articles: createArticles([
          "Time scale (Days/Weeks/Months)",
          "Filters / Search"
        ])
      },
      {
        id: "create",
        title: "Create / Manage",
        iconKey: "PlusCircle",
        articles: createArticles([
          "New cash flow plan",
          "Copy cash flow plan",
          "Delete cash flow plan",
          "Add milestone / work phase"
        ])
      },
      {
        id: "navigate",
        title: "Navigate / Views",
        iconKey: "Layout",
        articles: createArticles([
          "Module navigation",
          "Dashboard view",
          "Timeline view"
        ])
      },
      {
        id: "share",
        title: "Share / Sync",
        iconKey: "RefreshCw",
        articles: createArticles([
          "Share dataset button"
        ])
      }
    ]
  },
  {
    id: "cost-control-general-ui",
    title: "Cost Control",
    iconKey: "TrendingUp",
    description: "General UI",
    sections: [
      {
        id: "read",
        title: "Read / Understand",
        iconKey: "Eye",
        articles: createArticles([
          "Cost control grid (Budget/Prediction/Deviation/Paid/Expected/Remainder)",
          "Category totals / column footers",
          "Cost items area (per account)",
          "Prediction / Deviation indicators"
        ])
      },
      {
        id: "change",
        title: "Change / Control",
        iconKey: "Sliders",
        articles: createArticles([
          "Display Currency dropdown",
          "Toggle numbers vs formulas",
          "Filters / Search",
          "Additional columns",
          "Consolidate toggle",
          "Recalculate toggle"
        ])
      },
      {
        id: "create",
        title: "Create / Manage",
        iconKey: "PlusCircle",
        articles: createArticles([
          "New cost control set",
          "Copy cost control set",
          "Delete cost control set",
          "Add cost item row"
        ])
      },
      {
        id: "navigate",
        title: "Navigate / Views",
        iconKey: "Layout",
        articles: createArticles([
          "Module navigation",
          "Dashboard view",
          "Timeline view"
        ])
      },
      {
        id: "share",
        title: "Share / Sync",
        iconKey: "RefreshCw",
        articles: createArticles([
          "Share dataset button"
        ])
      }
    ]
  },
  {
    id: "admin-project-management",
    title: "Admin",
    iconKey: "ShieldCheck",
    description: "Project Management",
    sections: [
      {
        id: "read",
        title: "Read / Understand",
        iconKey: "Eye",
        articles: createArticles([
          "Members list / roles",
          "Project access status",
          "Share mode / access state"
        ])
      },
      {
        id: "change",
        title: "Change / Control",
        iconKey: "Sliders",
        articles: createArticles([
          "Permissions / role changes",
          "Sharing settings"
        ])
      },
      {
        id: "create",
        title: "Create / Manage",
        iconKey: "PlusCircle",
        articles: createArticles([
          "Invite member",
          "Remove member"
        ])
      },
      {
        id: "navigate",
        title: "Navigate / Views",
        iconKey: "Layout",
        articles: createArticles([
          "Back to project"
        ])
      },
      {
        id: "share",
        title: "Share / Sync",
        iconKey: "RefreshCw",
        articles: createArticles([
          "Share / revoke access"
        ])
      }
    ]
  },
  {
    id: "printing-sharing",
    title: "Printing & Sharing",
    iconKey: "Printer",
    description: "Exports, PDF & Teamwork",
    sections: [
      {
        id: "read",
        title: "Read / Understand",
        iconKey: "Eye",
        articles: createArticles([
          "Export/print options",
          "Active dataset selection"
        ])
      },
      {
        id: "change",
        title: "Change / Control",
        iconKey: "Sliders",
        articles: createArticles([
          "File format options (PDF/XLSX/KOST)",
          "Paper size / orientation"
        ])
      },
      {
        id: "create",
        title: "Create / Manage",
        iconKey: "PlusCircle",
        articles: createArticles([
          "Export to Excel",
          "Print to PDF",
          "Save template / export file"
        ])
      },
      {
        id: "navigate",
        title: "Navigate / Views",
        iconKey: "Layout",
        articles: createArticles([
          "Return to module"
        ])
      },
      {
        id: "share",
        title: "Share / Sync",
        iconKey: "RefreshCw",
        articles: createArticles([
          "Share exported files externally"
        ])
      }
    ]
  },
  {
    id: "licensing",
    title: "Licensing",
    iconKey: "CreditCard",
    description: "Plans & Billing",
    sections: [
      {
        id: "read",
        title: "Read / Understand",
        iconKey: "Eye",
        articles: createArticles([
          "Current plan / status",
          "Billing cycle / validity"
        ])
      },
      {
        id: "change",
        title: "Change / Control",
        iconKey: "Sliders",
        articles: createArticles([
          "Upgrade / downgrade options",
          "Payment method / billing details"
        ])
      },
      {
        id: "create",
        title: "Create / Manage",
        iconKey: "PlusCircle",
        articles: createArticles([
          "Start / cancel subscription"
        ])
      },
      {
        id: "navigate",
        title: "Navigate / Views",
        iconKey: "Layout",
        articles: createArticles([
          "Go to billing portal"
        ])
      },
      {
        id: "share",
        title: "Share / Sync",
        iconKey: "RefreshCw",
        articles: createArticles([
          "License sync / status updates"
        ])
      }
    ]
  },
  {
    id: "faq",
    title: "FAQ",
    iconKey: "CircleHelp",
    description: "Common Questions",
    sections: [
      {
        id: "read",
        title: "Read / Understand",
        iconKey: "Eye",
        articles: createArticles([
          "General FAQ",
          "System Requirements (OS, Apple M1, Internet)",
          "Licensing & Account (Upgrades, Cancellation)",
          "Data & Security (Storage, Archiving)",
          "Pricing & Invoices",
          "Support Availability"
        ])
      },
      {
        id: "change",
        title: "Change / Control",
        iconKey: "Sliders",
        articles: createArticles([
          "Search / filter questions"
        ])
      },
      {
        id: "create",
        title: "Create / Manage",
        iconKey: "PlusCircle",
        articles: []
      },
      {
        id: "navigate",
        title: "Navigate / Views",
        iconKey: "Layout",
        articles: createArticles([
          "Link to KB / Learning articles",
          "Support / Feature request"
        ])
      },
      {
        id: "share",
        title: "Share / Sync",
        iconKey: "RefreshCw",
        articles: []
      }
    ]
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
