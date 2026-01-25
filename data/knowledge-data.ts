
import { HelpMedia } from './taxonomy';

// --- NEW STRUCTURE TYPES ---

export interface KnowledgeSectionContent {
  heading: string;
  body: string; // Markdown-like, supports [[kb:id]] and [[learn:id]]
  media?: HelpMedia;
  // Updated: Removed 'technical', Added semantic types
  type?: 'definition' | 'example' | 'process' | 'warning' | 'tip' | 'note';
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

// Hosted image for prototype visibility
const PROTOTYPE_IMG_URL = "https://i.ibb.co/F13why4/KOSMA-Vergleich.png";

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
            "synonyms": [
              "grand total"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Grand Total helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "Grand Total is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Important Note",
                  "body": "The Grand Total only sums up visible rows. If you have active filters, hidden rows are excluded.",
                  "type": "note"
                },
                {
                  "heading": "Visual example",
                  "body": "Screenshot reference for context.",
                  "type": "example",
                  "media": {
                    "kind": "image",
                    "bucket": "help-assets",
                    "path": PROTOTYPE_IMG_URL,
                    "alt": "KOSMA Vergleich"
                  }
                }
              ]
            }
          },
          {
            "id": "budgeting-general-ui-screen-gliederung-read-understand-02-grid-values",
            "title": "Grid values",
            "synonyms": [
              "grid values"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Grid values helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "Grid values is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Example usage",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "example"
                }
              ]
            }
          },
          {
            "id": "budgeting-general-ui-screen-gliederung-read-understand-03-search-results",
            "title": "Search results",
            "synonyms": [
              "search results"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Search results helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "Search results is a read-only indicator that helps you interpret the current state of your work."
                }
              ]
            }
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "budgeting-general-ui-screen-gliederung-read-understand-01-grand-total",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "budgeting-general-ui-screen-gliederung-read-understand-02-grid-values",
              "label": 2,
              "x": 38,
              "y": 37
            },
            {
              "articleId": "budgeting-general-ui-screen-gliederung-read-understand-03-search-results",
              "label": 3,
              "x": 61,
              "y": 54
            }
          ]
        }
      },
      {
        "id": "change-control",
        "title": "Change / Control",
        "iconKey": "Sliders",
        "articles": [
          {
            "id": "einstellungen-von-waehrungen",
            "title": "Einstellungen von Währungen",
            "synonyms": [],
            "relatedLearningIds": [],
            "content": {
              "definition": "Währungen werden über ein zentrales Fenster gesteuert. Sie können entweder manuell eingegeben werden oder sind mit einer aktuellen Datenbank verbunden.",
              "sections": [
                {
                  "heading": "Vorgehen",
                  "body": "Klicke zuerst auf Admin.\nDann auf Einstellungen.\nDann auf Währungen.",
                  "type": "process"
                },
                {
                  "heading": "Wichtiger Hinweis",
                  "body": "Achtung, die Einstellungen haben auf das gesamte Projekt Einfluss, auch auf Cashflow.",
                  "type": "warning"
                },
                {
                  "heading": "Experten-Tipp",
                  "body": "Wenn du Währungen schwanken und beheben willst, gib bitte die Einheit pro Hand ein.",
                  "type": "tip"
                },
                {
                  "heading": "Rechenbeispiel",
                  "body": "Ein Dollar entspricht 84 Cent, ein Schweizer Franken 1,15 Euro.",
                  "type": "example"
                }
              ]
            }
          },
          {
            "id": "budgeting-general-ui-screen-gliederung-change-control-01-display-currency-dropdown",
            "title": "Display Currency Dropdown",
            "synonyms": [
              "display currency dropdown"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Display Currency Dropdown to adjust how data is displayed or calculated on this screen.",
              "sections": [
                {
                  "heading": "How to change currency",
                  "body": "Click on the dropdown menu in the top bar.\nSelect your desired currency from the list.\nThe entire budget view will recalculate instantly.",
                  "type": "process"
                },
                {
                  "heading": "Warning",
                  "body": "Changing the display currency does not change the base currency of your project. It is for visualization only.",
                  "type": "warning"
                }
              ]
            }
          },
          {
            "id": "budgeting-general-ui-screen-gliederung-change-control-02-numbers-vs-formulas-toggle",
            "title": "Numbers vs. Formulas Toggle",
            "synonyms": [
              "numbers vs. formulas toggle"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Numbers vs. Formulas Toggle to adjust how data is displayed or calculated on this screen.",
              "sections": [
                {
                  "heading": "What it controls",
                  "body": "Numbers vs. Formulas Toggle changes how information is displayed or calculated in this module."
                },
                {
                  "heading": "Tip",
                  "body": "Use this toggle to debug complex calculations. Seeing the formula often helps identify circular references.",
                  "type": "tip"
                }
              ]
            }
          },
          {
            "id": "budgeting-general-ui-screen-gliederung-change-control-03-fringes-supplements-extra-costs-toggle",
            "title": "Fringes/Supplements/Extra Costs Toggle",
            "synonyms": [
              "fringes/supplements/extra costs toggle"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Fringes/Supplements/Extra Costs Toggle to adjust how data is displayed or calculated on this screen.",
              "sections": [
                {
                  "heading": "What it controls",
                  "body": "Fringes/Supplements/Extra Costs Toggle changes how information is displayed or calculated in this module."
                }
              ]
            }
          },
          {
            "id": "budgeting-general-ui-screen-gliederung-change-control-04-filter-toggle",
            "title": "Filter Toggle",
            "synonyms": [
              "filter toggle"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Filter Toggle to adjust how data is displayed or calculated on this screen.",
              "sections": []
            }
          },
          {
            "id": "budgeting-general-ui-screen-gliederung-change-control-05-additional-columns-dropdown",
            "title": "Additional Columns Dropdown",
            "synonyms": [
              "additional columns dropdown"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Additional Columns Dropdown to adjust how data is displayed or calculated on this screen.",
              "sections": []
            }
          },
          {
            "id": "budgeting-general-ui-screen-gliederung-change-control-06-expand-grid-collapse-grid",
            "title": "Expand Grid / Collapse Grid",
            "synonyms": [
              "expand grid / collapse grid"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Expand Grid / Collapse Grid to adjust how data is displayed or calculated on this screen.",
              "sections": []
            }
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "budgeting-general-ui-screen-gliederung-change-control-01-display-currency-dropdown",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "budgeting-general-ui-screen-gliederung-change-control-02-numbers-vs-formulas-toggle",
              "label": 2,
              "x": 38,
              "y": 37
            },
            {
              "articleId": "budgeting-general-ui-screen-gliederung-change-control-03-fringes-supplements-extra-costs-toggle",
              "label": 3,
              "x": 61,
              "y": 54
            },
            {
              "articleId": "budgeting-general-ui-screen-gliederung-change-control-04-filter-toggle",
              "label": 4,
              "x": 84,
              "y": 71
            },
            {
              "articleId": "budgeting-general-ui-screen-gliederung-change-control-05-additional-columns-dropdown",
              "label": 5,
              "x": 37,
              "y": 28
            },
            {
              "articleId": "budgeting-general-ui-screen-gliederung-change-control-06-expand-grid-collapse-grid",
              "label": 6,
              "x": 60,
              "y": 45
            }
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
            "synonyms": [
              "add category"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Add Category lets you create or manage items directly in this module.",
              "sections": [
                {
                  "heading": "Process",
                  "body": "Click on the '+' icon in the toolbar.\nSelect 'Category' from the menu.\nEnter the name of the new category.\nPress Enter to save.",
                  "type": "process"
                }
              ]
            }
          },
          {
            "id": "budgeting-general-ui-screen-gliederung-create-manage-02-add-group",
            "title": "Add Group",
            "synonyms": [
              "add group"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Add Group lets you create or manage items directly in this module.",
              "sections": [
                {
                  "heading": "What you can create",
                  "body": "Add Group is used to create, duplicate, or manage items in this screen."
                }
              ]
            }
          },
          {
            "id": "budgeting-general-ui-screen-gliederung-create-manage-03-add-account",
            "title": "Add Account",
            "synonyms": [
              "add account"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Add Account lets you create or manage items directly in this module.",
              "sections": [
                {
                  "heading": "What you can create",
                  "body": "Add Account is used to create, duplicate, or manage items in this screen."
                }
              ]
            }
          },
          {
            "id": "budgeting-general-ui-screen-gliederung-create-manage-04-add-subaccount",
            "title": "Add Subaccount",
            "synonyms": [
              "add subaccount"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Add Subaccount lets you create or manage items directly in this module.",
              "sections": []
            }
          },
          {
            "id": "budgeting-general-ui-screen-gliederung-create-manage-05-delete-selected-element",
            "title": "Delete Selected Element",
            "synonyms": [
              "delete selected element"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Delete Selected Element lets you create or manage items directly in this module.",
              "sections": [
                 {
                    "heading": "Warning",
                    "body": "Deleting a category will also delete all groups and accounts contained within it. This action cannot be undone if you save the project.",
                    "type": "warning"
                 }
              ]
            }
          },
          {
            "id": "budgeting-general-ui-screen-gliederung-create-manage-06-deactivate-activate-row",
            "title": "Deactivate / Activate Row",
            "synonyms": [
              "deactivate / activate row"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Deactivate / Activate Row lets you create or manage items directly in this module.",
              "sections": []
            }
          },
          {
            "id": "budgeting-general-ui-screen-gliederung-create-manage-07-renumber-items",
            "title": "Renumber Items",
            "synonyms": [
              "renumber items"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Renumber Items lets you create or manage items directly in this module.",
              "sections": []
            }
          },
          {
            "id": "budgeting-general-ui-screen-gliederung-create-manage-08-duplicate-dataset",
            "title": "Duplicate Dataset",
            "synonyms": [
              "duplicate dataset"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Duplicate Dataset lets you create or manage items directly in this module.",
              "sections": []
            }
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "budgeting-general-ui-screen-gliederung-create-manage-01-add-category",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "budgeting-general-ui-screen-gliederung-create-manage-02-add-group",
              "label": 2,
              "x": 38,
              "y": 37
            },
            {
              "articleId": "budgeting-general-ui-screen-gliederung-create-manage-03-add-account",
              "label": 3,
              "x": 61,
              "y": 54
            },
            {
              "articleId": "budgeting-general-ui-screen-gliederung-create-manage-04-add-subaccount",
              "label": 4,
              "x": 84,
              "y": 71
            },
            {
              "articleId": "budgeting-general-ui-screen-gliederung-create-manage-05-delete-selected-element",
              "label": 5,
              "x": 37,
              "y": 28
            },
            {
              "articleId": "budgeting-general-ui-screen-gliederung-create-manage-06-deactivate-activate-row",
              "label": 6,
              "x": 60,
              "y": 45
            },
            {
              "articleId": "budgeting-general-ui-screen-gliederung-create-manage-07-renumber-items",
              "label": 7,
              "x": 83,
              "y": 62
            },
            {
              "articleId": "budgeting-general-ui-screen-gliederung-create-manage-08-duplicate-dataset",
              "label": 8,
              "x": 36,
              "y": 79
            }
          ]
        }
      }
    ]
  }
  // ... other categories would follow similar structure updates
];

export const findArticleById = (id: string) => {
  for (const category of KB_DATA) {
    for (const section of category.sections) {
      const article = section.articles.find(a => a.id === id);
      if (article) {
        return { article, category };
      }
    }
  }
  return undefined;
};
