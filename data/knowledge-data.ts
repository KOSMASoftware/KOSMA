
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

// Neu: Marker Datenstruktur
export interface ImageMarker {
  articleId: string;
  label: number; // Die Nummer im Kreis (1, 2, 3...)
  x: number;     // % von Links
  y: number;     // % von Oben
}

// Neu: Container für das Bild
export interface VisualMap {
  imageSrc: string;
  markers: ImageMarker[];
}

export interface KnowledgeSection {
  id: string; 
  title: string; 
  iconKey: string; 
  visualMap?: VisualMap; // Optionales visuelles Overlay
  articles: KnowledgeArticle[];
}

export interface KnowledgeCategory {
  id: string;
  title: string;
  iconKey: string;
  description: string;
  sections: KnowledgeSection[];
}

// Full Dataset from JSON
// Note: Replacing 'demo/kosma-vergleich.png' with the hosted URL for prototype visibility
const IMG_URL = "https://i.ibb.co/F13why4/KOSMA-Vergleich.png";

export const KB_DATA: KnowledgeCategory[] = [
  {
    "id": "budgeting-general-ui-screen-gliederung",
    "title": "Budgeting – General UI (Screen-Gliederung)",
    "iconKey": "BookOpen",
    "description": "General UI & Screen Structure",
    "sections": [
      {
        "id": "read-understand",
        "title": "Read / Understand",
        "iconKey": "Eye",
        "articles": [
          {
            "id": "budgeting-general-ui-screen-gliederung-read-understand-01-grand-total",
            "title": "Grand Total",
            "synonyms": ["grand total"],
            "relatedLearningIds": [],
            "content": {
              "definition": "Grand Total helps you interpret the current state of your data on this screen.",
              "sections": [
                { "heading": "What it shows", "body": "Grand Total is a read-only indicator that helps you interpret the current state of your work." },
                { "heading": "Example", "body": "Check this area after applying filters to verify what is included in your view.", "type": "technical" },
                { "heading": "Visual example", "body": "Screenshot reference for context.", "type": "example", "media": { "kind": "image", "bucket": "help-assets", "path": IMG_URL, "alt": "KOSMA Vergleich" } }
              ]
            }
          },
          {
            "id": "budgeting-general-ui-screen-gliederung-read-understand-02-grid-values",
            "title": "Grid values",
            "synonyms": ["grid values"],
            "relatedLearningIds": [],
            "content": {
              "definition": "Grid values helps you interpret the current state of your data on this screen.",
              "sections": [
                { "heading": "What it shows", "body": "Grid values is a read-only indicator that helps you interpret the current state of your work." },
                { "heading": "Example", "body": "Check this area after applying filters to verify what is included in your view.", "type": "technical" },
                { "heading": "Visual example", "body": "Screenshot reference for context.", "type": "example", "media": { "kind": "image", "bucket": "help-assets", "path": IMG_URL, "alt": "KOSMA Vergleich" } }
              ]
            }
          },
          {
            "id": "budgeting-general-ui-screen-gliederung-read-understand-03-search-results",
            "title": "Search results",
            "synonyms": ["search results"],
            "relatedLearningIds": [],
            "content": {
              "definition": "Search results helps you interpret the current state of your data on this screen.",
              "sections": [
                { "heading": "What it shows", "body": "Search results is a read-only indicator that helps you interpret the current state of your work." },
                { "heading": "Example", "body": "Check this area after applying filters to verify what is included in your view.", "type": "technical" },
                { "heading": "Visual example", "body": "Screenshot reference for context.", "type": "example", "media": { "kind": "image", "bucket": "help-assets", "path": IMG_URL, "alt": "KOSMA Vergleich" } }
              ]
            }
          }
        ],
        "visualMap": {
          "imageSrc": IMG_URL,
          "markers": [
            { "articleId": "budgeting-general-ui-screen-gliederung-read-understand-01-grand-total", "label": 1, "x": 15, "y": 20 },
            { "articleId": "budgeting-general-ui-screen-gliederung-read-understand-02-grid-values", "label": 2, "x": 38, "y": 37 },
            { "articleId": "budgeting-general-ui-screen-gliederung-read-understand-03-search-results", "label": 3, "x": 61, "y": 54 }
          ]
        }
      },
      {
        "id": "change-control",
        "title": "Change / Control",
        "iconKey": "Sliders",
        "articles": [
          {
            "id": "budgeting-general-ui-screen-gliederung-change-control-01-display-currency-dropdown",
            "title": "Display Currency Dropdown",
            "synonyms": ["display currency dropdown"],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Display Currency Dropdown to adjust how data is displayed or calculated on this screen.",
              "sections": [
                { "heading": "What it controls", "body": "Display Currency Dropdown changes how information is displayed or calculated in this module." },
                { "heading": "Example", "body": "Toggle the setting and compare the output before and after to confirm the effect.", "type": "technical" },
                { "heading": "Visual example", "body": "Screenshot reference for context.", "type": "example", "media": { "kind": "image", "bucket": "help-assets", "path": IMG_URL, "alt": "KOSMA Vergleich" } }
              ]
            }
          },
          {
            "id": "budgeting-general-ui-screen-gliederung-change-control-02-numbers-vs-formulas-toggle",
            "title": "Numbers vs. Formulas Toggle",
            "synonyms": ["numbers vs. formulas toggle"],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Numbers vs. Formulas Toggle to adjust how data is displayed or calculated on this screen.",
              "sections": [
                { "heading": "What it controls", "body": "Numbers vs. Formulas Toggle changes how information is displayed or calculated in this module." },
                { "heading": "Example", "body": "Toggle the setting and compare the output before and after to confirm the effect.", "type": "technical" },
                { "heading": "Visual example", "body": "Screenshot reference for context.", "type": "example", "media": { "kind": "image", "bucket": "help-assets", "path": IMG_URL, "alt": "KOSMA Vergleich" } }
              ]
            }
          },
          {
            "id": "budgeting-general-ui-screen-gliederung-change-control-03-fringes-supplements-extra-costs-toggle",
            "title": "Fringes/Supplements/Extra Costs Toggle",
            "synonyms": ["fringes/supplements/extra costs toggle"],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Fringes/Supplements/Extra Costs Toggle to adjust how data is displayed or calculated on this screen.",
              "sections": [
                { "heading": "What it controls", "body": "Fringes/Supplements/Extra Costs Toggle changes how information is displayed or calculated in this module." },
                { "heading": "Example", "body": "Toggle the setting and compare the output before and after to confirm the effect.", "type": "technical" },
                { "heading": "Visual example", "body": "Screenshot reference for context.", "type": "example", "media": { "kind": "image", "bucket": "help-assets", "path": IMG_URL, "alt": "KOSMA Vergleich" } }
              ]
            }
          }
        ],
        "visualMap": {
          "imageSrc": IMG_URL,
          "markers": [
            { "articleId": "budgeting-general-ui-screen-gliederung-change-control-01-display-currency-dropdown", "label": 1, "x": 15, "y": 20 },
            { "articleId": "budgeting-general-ui-screen-gliederung-change-control-02-numbers-vs-formulas-toggle", "label": 2, "x": 38, "y": 37 },
            { "articleId": "budgeting-general-ui-screen-gliederung-change-control-03-fringes-supplements-extra-costs-toggle", "label": 3, "x": 61, "y": 54 }
          ]
        }
      },
      {
        "id": "create-manage",
        "title": "Create / Manage",
        "iconKey": "PlusCircle",
        "articles": [
          {
            "id": "budgeting-general-ui-screen-gliederung-create-manage-01-add-category",
            "title": "Add Category",
            "synonyms": ["add category"],
            "relatedLearningIds": [],
            "content": {
              "definition": "Add Category lets you create or manage items directly in this module.",
              "sections": [
                { "heading": "What you can create", "body": "Add Category is used to create, duplicate, or manage items in this screen." },
                { "heading": "Example", "body": "Create a new item, rename it, and save to confirm it appears in the list.", "type": "technical" },
                { "heading": "Visual example", "body": "Screenshot reference for context.", "type": "example", "media": { "kind": "image", "bucket": "help-assets", "path": IMG_URL, "alt": "KOSMA Vergleich" } }
              ]
            }
          },
          {
            "id": "budgeting-general-ui-screen-gliederung-create-manage-02-add-group",
            "title": "Add Group",
            "synonyms": ["add group"],
            "relatedLearningIds": [],
            "content": {
              "definition": "Add Group lets you create or manage items directly in this module.",
              "sections": [
                { "heading": "What you can create", "body": "Add Group is used to create, duplicate, or manage items in this screen." },
                { "heading": "Example", "body": "Create a new item, rename it, and save to confirm it appears in the list.", "type": "technical" },
                { "heading": "Visual example", "body": "Screenshot reference for context.", "type": "example", "media": { "kind": "image", "bucket": "help-assets", "path": IMG_URL, "alt": "KOSMA Vergleich" } }
              ]
            }
          }
        ],
        "visualMap": {
          "imageSrc": IMG_URL,
          "markers": [
            { "articleId": "budgeting-general-ui-screen-gliederung-create-manage-01-add-category", "label": 1, "x": 15, "y": 20 },
            { "articleId": "budgeting-general-ui-screen-gliederung-create-manage-02-add-group", "label": 2, "x": 38, "y": 37 }
          ]
        }
      },
      {
        "id": "navigate-views",
        "title": "Navigate / Views",
        "iconKey": "Layout",
        "articles": [
          {
            "id": "budgeting-general-ui-screen-gliederung-navigate-views-01-module-navigation-bar",
            "title": "Module Navigation Bar",
            "synonyms": ["module navigation bar"],
            "relatedLearningIds": [],
            "content": {
              "definition": "Module Navigation Bar helps you switch views or move to related modules.",
              "sections": [
                { "heading": "Where it takes you", "body": "Module Navigation Bar takes you to a different view or module without losing context." },
                { "heading": "Example", "body": "Use it to switch from Budgeting to Financing and compare the same project data.", "type": "technical" },
                { "heading": "Visual example", "body": "Screenshot reference for context.", "type": "example", "media": { "kind": "image", "bucket": "help-assets", "path": IMG_URL, "alt": "KOSMA Vergleich" } }
              ]
            }
          }
        ],
        "visualMap": {
          "imageSrc": IMG_URL,
          "markers": [
            { "articleId": "budgeting-general-ui-screen-gliederung-navigate-views-01-module-navigation-bar", "label": 1, "x": 15, "y": 20 }
          ]
        }
      }
    ]
  },
  {
    "id": "project-manager-projects",
    "title": "Project Manager / Projects",
    "iconKey": "Film",
    "description": "General UI & Screen Structure",
    "sections": [
      {
        "id": "read-understand",
        "title": "Read / Understand",
        "iconKey": "Eye",
        "articles": [
          {
            "id": "project-manager-projects-read-understand-01-projects-list",
            "title": "Projects list",
            "synonyms": ["projects list"],
            "relatedLearningIds": ["registration"],
            "content": {
              "definition": "Projects list helps you interpret the current state of your data on this screen.",
              "sections": [
                { "heading": "What it shows", "body": "Projects list is a read-only indicator that helps you interpret the current state of your work." },
                { "heading": "Example", "body": "Check this area after applying filters to verify what is included in your view.", "type": "technical" },
                { "heading": "Visual example", "body": "Screenshot reference for context.", "type": "example", "media": { "kind": "image", "bucket": "help-assets", "path": IMG_URL, "alt": "KOSMA Vergleich" } }
              ]
            }
          },
          {
            "id": "project-manager-projects-read-understand-02-permission-column",
            "title": "Permission column",
            "synonyms": ["permission column"],
            "relatedLearningIds": ["registration"],
            "content": {
              "definition": "Permission column helps you interpret the current state of your data on this screen.",
              "sections": [
                { "heading": "What it shows", "body": "Permission column is a read-only indicator that helps you interpret the current state of your work." },
                { "heading": "Example", "body": "Check this area after applying filters to verify what is included in your view.", "type": "technical" },
                { "heading": "Visual example", "body": "Screenshot reference for context.", "type": "example", "media": { "kind": "image", "bucket": "help-assets", "path": IMG_URL, "alt": "KOSMA Vergleich" } }
              ]
            }
          }
        ],
        "visualMap": {
          "imageSrc": IMG_URL,
          "markers": [
            { "articleId": "project-manager-projects-read-understand-01-projects-list", "label": 1, "x": 15, "y": 20 },
            { "articleId": "project-manager-projects-read-understand-02-permission-column", "label": 2, "x": 38, "y": 37 }
          ]
        }
      },
      {
        "id": "create-manage",
        "title": "Create / Manage",
        "iconKey": "PlusCircle",
        "articles": [
          {
            "id": "project-manager-projects-create-manage-01-create-new-project",
            "title": "Create new project",
            "synonyms": ["create new project"],
            "relatedLearningIds": ["registration"],
            "content": {
              "definition": "Create new project lets you create or manage items directly in this module.",
              "sections": [
                { "heading": "What you can create", "body": "Create new project is used to create, duplicate, or manage items in this screen." },
                { "heading": "Example", "body": "Create a new item, rename it, and save to confirm it appears in the list.", "type": "technical" },
                { "heading": "Visual example", "body": "Screenshot reference for context.", "type": "example", "media": { "kind": "image", "bucket": "help-assets", "path": IMG_URL, "alt": "KOSMA Vergleich" } }
              ]
            }
          }
        ],
        "visualMap": {
          "imageSrc": IMG_URL,
          "markers": [
            { "articleId": "project-manager-projects-create-manage-01-create-new-project", "label": 1, "x": 15, "y": 20 }
          ]
        }
      }
    ]
  },
  {
    "id": "financing-general-ui",
    "title": "Financing – General UI",
    "iconKey": "PieChart",
    "description": "General UI & Screen Structure",
    "sections": [
      {
        "id": "read-understand",
        "title": "Read / Understand",
        "iconKey": "Eye",
        "articles": [
          {
            "id": "financing-general-ui-read-understand-01-financing-grid-values",
            "title": "Financing grid values",
            "synonyms": ["financing grid values"],
            "relatedLearningIds": [],
            "content": {
              "definition": "Financing grid values helps you interpret the current state of your data on this screen.",
              "sections": [
                { "heading": "What it shows", "body": "Financing grid values is a read-only indicator that helps you interpret the current state of your work." },
                { "heading": "Example", "body": "Check this area after applying filters to verify what is included in your view.", "type": "technical" },
                { "heading": "Visual example", "body": "Screenshot reference for context.", "type": "example", "media": { "kind": "image", "bucket": "help-assets", "path": IMG_URL, "alt": "KOSMA Vergleich" } }
              ]
            }
          }
        ],
        "visualMap": {
          "imageSrc": IMG_URL,
          "markers": [
            { "articleId": "financing-general-ui-read-understand-01-financing-grid-values", "label": 1, "x": 15, "y": 20 }
          ]
        }
      }
    ]
  },
  {
    "id": "cash-flow-general-ui",
    "title": "Cash Flow – General UI",
    "iconKey": "Coins",
    "description": "General UI & Screen Structure",
    "sections": [
      {
        "id": "read-understand",
        "title": "Read / Understand",
        "iconKey": "Eye",
        "articles": [
          {
            "id": "cash-flow-general-ui-read-understand-01-cash-flow-grid",
            "title": "Cash flow grid",
            "synonyms": ["cash flow grid"],
            "relatedLearningIds": [],
            "content": {
              "definition": "Cash flow grid helps you interpret the current state of your data on this screen.",
              "sections": [
                { "heading": "What it shows", "body": "Cash flow grid is a read-only indicator that helps you interpret the current state of your work." },
                { "heading": "Example", "body": "Check this area after applying filters to verify what is included in your view.", "type": "technical" },
                { "heading": "Visual example", "body": "Screenshot reference for context.", "type": "example", "media": { "kind": "image", "bucket": "help-assets", "path": IMG_URL, "alt": "KOSMA Vergleich" } }
              ]
            }
          }
        ],
        "visualMap": {
          "imageSrc": IMG_URL,
          "markers": [
            { "articleId": "cash-flow-general-ui-read-understand-01-cash-flow-grid", "label": 1, "x": 15, "y": 20 }
          ]
        }
      }
    ]
  },
  {
    "id": "cost-control-general-ui",
    "title": "Cost Control – General UI",
    "iconKey": "TrendingUp",
    "description": "General UI & Screen Structure",
    "sections": [
      {
        "id": "read-understand",
        "title": "Read / Understand",
        "iconKey": "Eye",
        "articles": [
          {
            "id": "cost-control-general-ui-read-understand-01-cost-control-grid",
            "title": "Cost control grid",
            "synonyms": ["cost control grid"],
            "relatedLearningIds": [],
            "content": {
              "definition": "Cost control grid helps you interpret the current state of your data on this screen.",
              "sections": [
                { "heading": "What it shows", "body": "Cost control grid is a read-only indicator that helps you interpret the current state of your work." },
                { "heading": "Example", "body": "Check this area after applying filters to verify what is included in your view.", "type": "technical" },
                { "heading": "Visual example", "body": "Screenshot reference for context.", "type": "example", "media": { "kind": "image", "bucket": "help-assets", "path": IMG_URL, "alt": "KOSMA Vergleich" } }
              ]
            }
          }
        ],
        "visualMap": {
          "imageSrc": IMG_URL,
          "markers": [
            { "articleId": "cost-control-general-ui-read-understand-01-cost-control-grid", "label": 1, "x": 15, "y": 20 }
          ]
        }
      }
    ]
  },
  {
    "id": "admin-project-management",
    "title": "Admin / Project Management",
    "iconKey": "Settings",
    "description": "General UI & Screen Structure",
    "sections": [
      {
        "id": "read-understand",
        "title": "Read / Understand",
        "iconKey": "Eye",
        "articles": [
          {
            "id": "admin-project-management-read-understand-01-members-list-roles",
            "title": "Members list / roles",
            "synonyms": ["members list / roles"],
            "relatedLearningIds": ["registration"],
            "content": {
              "definition": "Members list / roles helps you interpret the current state of your data on this screen.",
              "sections": [
                { "heading": "What it shows", "body": "Members list / roles is a read-only indicator that helps you interpret the current state of your work." },
                { "heading": "Example", "body": "Check this area after applying filters to verify what is included in your view.", "type": "technical" },
                { "heading": "Visual example", "body": "Screenshot reference for context.", "type": "example", "media": { "kind": "image", "bucket": "help-assets", "path": IMG_URL, "alt": "KOSMA Vergleich" } }
              ]
            }
          }
        ],
        "visualMap": {
          "imageSrc": IMG_URL,
          "markers": [
            { "articleId": "admin-project-management-read-understand-01-members-list-roles", "label": 1, "x": 15, "y": 20 }
          ]
        }
      }
    ]
  },
  {
    "id": "printing-sharing",
    "title": "Printing & Sharing",
    "iconKey": "Printer",
    "description": "General UI & Screen Structure",
    "sections": [
      {
        "id": "read-understand",
        "title": "Read / Understand",
        "iconKey": "Eye",
        "articles": [
          {
            "id": "printing-sharing-read-understand-01-export-print-options",
            "title": "Export/print options",
            "synonyms": ["export/print options"],
            "relatedLearningIds": [],
            "content": {
              "definition": "Export/print options helps you interpret the current state of your data on this screen.",
              "sections": [
                { "heading": "What it shows", "body": "Export/print options is a read-only indicator that helps you interpret the current state of your work." },
                { "heading": "Example", "body": "Check this area after applying filters to verify what is included in your view.", "type": "technical" },
                { "heading": "Visual example", "body": "Screenshot reference for context.", "type": "example", "media": { "kind": "image", "bucket": "help-assets", "path": IMG_URL, "alt": "KOSMA Vergleich" } }
              ]
            }
          }
        ],
        "visualMap": {
          "imageSrc": IMG_URL,
          "markers": [
            { "articleId": "printing-sharing-read-understand-01-export-print-options", "label": 1, "x": 15, "y": 20 }
          ]
        }
      }
    ]
  },
  {
    "id": "licensing",
    "title": "Licensing",
    "iconKey": "ShieldCheck",
    "description": "General UI & Screen Structure",
    "sections": [
      {
        "id": "read-understand",
        "title": "Read / Understand",
        "iconKey": "Eye",
        "articles": [
          {
            "id": "licensing-read-understand-01-current-plan-status",
            "title": "Current plan / status",
            "synonyms": ["current plan / status"],
            "relatedLearningIds": [],
            "content": {
              "definition": "Current plan / status helps you interpret the current state of your data on this screen.",
              "sections": [
                { "heading": "What it shows", "body": "Current plan / status is a read-only indicator that helps you interpret the current state of your work." },
                { "heading": "Example", "body": "Check this area after applying filters to verify what is included in your view.", "type": "technical" },
                { "heading": "Visual example", "body": "Screenshot reference for context.", "type": "example", "media": { "kind": "image", "bucket": "help-assets", "path": IMG_URL, "alt": "KOSMA Vergleich" } }
              ]
            }
          }
        ],
        "visualMap": {
          "imageSrc": IMG_URL,
          "markers": [
            { "articleId": "licensing-read-understand-01-current-plan-status", "label": 1, "x": 15, "y": 20 }
          ]
        }
      }
    ]
  },
  {
    "id": "faq",
    "title": "FAQ",
    "iconKey": "CircleHelp",
    "description": "General UI & Screen Structure",
    "sections": [
      {
        "id": "read-understand",
        "title": "Read / Understand",
        "iconKey": "Eye",
        "articles": [
          {
            "id": "faq-read-understand-01-faq-list-answers",
            "title": "FAQ list / answers",
            "synonyms": ["faq list / answers"],
            "relatedLearningIds": [],
            "content": {
              "definition": "FAQ list / answers helps you interpret the current state of your data on this screen.",
              "sections": [
                { "heading": "What it shows", "body": "FAQ list / answers is a read-only indicator that helps you interpret the current state of your work." },
                { "heading": "Example", "body": "Check this area after applying filters to verify what is included in your view.", "type": "technical" },
                { "heading": "Visual example", "body": "Screenshot reference for context.", "type": "example", "media": { "kind": "image", "bucket": "help-assets", "path": IMG_URL, "alt": "KOSMA Vergleich" } }
              ]
            }
          }
        ],
        "visualMap": {
          "imageSrc": IMG_URL,
          "markers": [
            { "articleId": "faq-read-understand-01-faq-list-answers", "label": 1, "x": 15, "y": 20 }
          ]
        }
      }
    ]
  }
];

// --- HELPER FOR SMART LINKS ---
export const findArticleById = (id: string): { article: KnowledgeArticle, category: KnowledgeCategory } | null => {
  for (const cat of KB_DATA) {
    for (const sec of cat.sections) {
      const found = sec.articles.find(a => a.id === id);
      if (found) return { article: found, category: cat };
    }
  }
  return null;
};
