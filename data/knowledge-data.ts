
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
  visualMap?: VisualMap; // Neu: Optionales visuelles Overlay
  articles: KnowledgeArticle[];
}

export interface KnowledgeCategory {
  id: string;
  title: string;
  iconKey: string;
  description: string;
  sections: KnowledgeSection[];
}

// Helper to generate mock positions for prototyping
const mockVisualMap = (articles: any[]): VisualMap => {
  return {
    imageSrc: 'https://i.ibb.co/F13why4/KOSMA-Vergleich.png',
    markers: articles.map((art, idx) => ({
      articleId: art.id,
      label: idx + 1,
      // Simple algorithm to scatter points for demo purposes
      x: 15 + ((idx * 23) % 70), 
      y: 20 + ((idx * 17) % 60)
    }))
  };
};

const RAW_DATA: KnowledgeCategory[] = [
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
                { "heading": "What it shows", "body": "Grand Total is a read-only indicator that helps you interpret the current state of your work." }
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
                { "heading": "What it shows", "body": "Grid values is a read-only indicator that helps you interpret the current state of your work." }
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
                { "heading": "What it shows", "body": "Search results is a read-only indicator that helps you interpret the current state of your work." }
              ]
            }
          }
        ]
      },
      {
        "id": "change-control",
        "title": "Change / Control",
        "iconKey": "Sliders",
        "articles": [
          {
            "id": "budgeting-general-ui-screen-gliederung-change-control-01-display-currency-dropdown",
            "title": "Display Currency Dropdown",
            "synonyms": [],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Display Currency Dropdown to adjust how data is displayed.",
              "sections": []
            }
          },
          {
            "id": "budgeting-general-ui-screen-gliederung-change-control-02-numbers-vs-formulas-toggle",
            "title": "Numbers vs. Formulas Toggle",
            "synonyms": [],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Numbers vs. Formulas Toggle to adjust how data is displayed.",
              "sections": []
            }
          },
          {
            "id": "budgeting-general-ui-screen-gliederung-change-control-03-fringes-supplements-extra-costs-toggle",
            "title": "Fringes/Supplements Toggle",
            "synonyms": [],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Fringes/Supplements/Extra Costs Toggle to adjust view.",
              "sections": []
            }
          }
        ]
      },
      {
        "id": "create-manage",
        "title": "Create / Manage",
        "iconKey": "PlusCircle",
        "articles": [
          {
            "id": "budgeting-general-ui-screen-gliederung-create-manage-01-add-category",
            "title": "Add Category",
            "synonyms": [],
            "relatedLearningIds": [],
            "content": { "definition": "Add Category lets you create items.", "sections": [] }
          },
          {
            "id": "budgeting-general-ui-screen-gliederung-create-manage-02-add-group",
            "title": "Add Group",
            "synonyms": [],
            "relatedLearningIds": [],
            "content": { "definition": "Add Group lets you create items.", "sections": [] }
          }
        ]
      },
      {
        "id": "navigate-views",
        "title": "Navigate / Views",
        "iconKey": "Layout",
        "articles": [
          {
            "id": "budgeting-general-ui-screen-gliederung-navigate-views-01-module-navigation-bar",
            "title": "Module Navigation Bar",
            "synonyms": [],
            "relatedLearningIds": [],
            "content": { "definition": "Module Navigation Bar helps you switch views.", "sections": [] }
          }
        ]
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
            "synonyms": [],
            "relatedLearningIds": [],
            "content": { "definition": "Projects list helps you interpret current state.", "sections": [] }
          },
          {
            "id": "project-manager-projects-read-understand-02-permission-column",
            "title": "Permission column",
            "synonyms": [],
            "relatedLearningIds": [],
            "content": { "definition": "Permission column helps you interpret current state.", "sections": [] }
          }
        ]
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
            "synonyms": [],
            "relatedLearningIds": [],
            "content": { "definition": "Financing grid values helps you interpret state.", "sections": [] }
          }
        ]
      }
    ]
  }
];

// Automatically inject mock visual maps for the prototype
export const KB_DATA: KnowledgeCategory[] = RAW_DATA.map(cat => ({
  ...cat,
  sections: cat.sections.map(sec => ({
    ...sec,
    visualMap: mockVisualMap(sec.articles)
  }))
}));

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
