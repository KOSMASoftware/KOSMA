
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
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
                },
                {
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
                  "heading": "What it controls",
                  "body": "Display Currency Dropdown changes how information is displayed or calculated in this module."
                },
                {
                  "heading": "Example",
                  "body": "Toggle the setting and compare the output before and after to confirm the effect.",
                  "type": "technical"
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
                  "heading": "Example",
                  "body": "Toggle the setting and compare the output before and after to confirm the effect.",
                  "type": "technical"
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
                },
                {
                  "heading": "Example",
                  "body": "Toggle the setting and compare the output before and after to confirm the effect.",
                  "type": "technical"
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
                  "heading": "What you can create",
                  "body": "Add Category is used to create, duplicate, or manage items in this screen."
                },
                {
                  "heading": "Example",
                  "body": "Create a new item, rename it, and save to confirm it appears in the list.",
                  "type": "technical"
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
                },
                {
                  "heading": "Example",
                  "body": "Create a new item, rename it, and save to confirm it appears in the list.",
                  "type": "technical"
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
                },
                {
                  "heading": "Example",
                  "body": "Create a new item, rename it, and save to confirm it appears in the list.",
                  "type": "technical"
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
              "sections": []
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
      },
      {
        "id": "navigate-views",
        "title": "Navigate / Views",
        "iconKey": "Layout",
        "articles": [
          {
            "id": "budgeting-general-ui-screen-gliederung-navigate-views-01-module-navigation-bar",
            "title": "Module Navigation Bar",
            "synonyms": [
              "module navigation bar"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Module Navigation Bar helps you switch views or move to related modules.",
              "sections": [
                {
                  "heading": "Where it takes you",
                  "body": "Module Navigation Bar takes you to a different view or module without losing context."
                },
                {
                  "heading": "Example",
                  "body": "Use it to switch from Budgeting to Financing and compare the same project data.",
                  "type": "technical"
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
            "id": "budgeting-general-ui-screen-gliederung-navigate-views-02-dashboard-button",
            "title": "Dashboard Button",
            "synonyms": [
              "dashboard button"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Dashboard Button helps you switch views or move to related modules.",
              "sections": [
                {
                  "heading": "Where it takes you",
                  "body": "Dashboard Button takes you to a different view or module without losing context."
                },
                {
                  "heading": "Example",
                  "body": "Use it to switch from Budgeting to Financing and compare the same project data.",
                  "type": "technical"
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
            "id": "budgeting-general-ui-screen-gliederung-navigate-views-03-timeline-button",
            "title": "Timeline Button",
            "synonyms": [
              "timeline button"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Timeline Button helps you switch views or move to related modules.",
              "sections": [
                {
                  "heading": "Where it takes you",
                  "body": "Timeline Button takes you to a different view or module without losing context."
                },
                {
                  "heading": "Example",
                  "body": "Use it to switch from Budgeting to Financing and compare the same project data.",
                  "type": "technical"
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
            "id": "budgeting-general-ui-screen-gliederung-navigate-views-04-markups-shortcut",
            "title": "Markups Shortcut",
            "synonyms": [
              "markups shortcut"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Markups Shortcut helps you switch views or move to related modules.",
              "sections": []
            }
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "budgeting-general-ui-screen-gliederung-navigate-views-01-module-navigation-bar",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "budgeting-general-ui-screen-gliederung-navigate-views-02-dashboard-button",
              "label": 2,
              "x": 38,
              "y": 37
            },
            {
              "articleId": "budgeting-general-ui-screen-gliederung-navigate-views-03-timeline-button",
              "label": 3,
              "x": 61,
              "y": 54
            },
            {
              "articleId": "budgeting-general-ui-screen-gliederung-navigate-views-04-markups-shortcut",
              "label": 4,
              "x": 84,
              "y": 71
            }
          ]
        }
      },
      {
        "id": "share-sync",
        "title": "Share / Sync",
        "iconKey": "RefreshCw",
        "articles": [
          {
            "id": "budgeting-general-ui-screen-gliederung-share-sync-01-share-dataset-button",
            "title": "Share Dataset Button",
            "synonyms": [
              "share dataset button"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Share Dataset Button is used to share, export, or sync your data.",
              "sections": [
                {
                  "heading": "What it does",
                  "body": "Share Dataset Button is used to share, export, or sync data with collaborators or files."
                },
                {
                  "heading": "Example",
                  "body": "Export the current dataset and verify that the latest changes are included.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "budgeting-general-ui-screen-gliederung-share-sync-01-share-dataset-button",
              "label": 1,
              "x": 15,
              "y": 20
            }
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
            "synonyms": [
              "projects list"
            ],
            "relatedLearningIds": [
              "registration"
            ],
            "content": {
              "definition": "Projects list helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "Projects list is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
            "id": "project-manager-projects-read-understand-02-permission-column",
            "title": "Permission column",
            "synonyms": [
              "permission column"
            ],
            "relatedLearningIds": [
              "registration"
            ],
            "content": {
              "definition": "Permission column helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "Permission column is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
            "id": "project-manager-projects-read-understand-03-project-status-metadata",
            "title": "Project status/metadata",
            "synonyms": [
              "project status/metadata"
            ],
            "relatedLearningIds": [
              "registration"
            ],
            "content": {
              "definition": "Project status/metadata helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "Project status/metadata is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
            "id": "project-manager-projects-read-understand-04-active-project-indicator",
            "title": "Active project indicator",
            "synonyms": [
              "active project indicator"
            ],
            "relatedLearningIds": [
              "registration"
            ],
            "content": {
              "definition": "Active project indicator helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "project-manager-projects-read-understand-01-projects-list",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "project-manager-projects-read-understand-02-permission-column",
              "label": 2,
              "x": 38,
              "y": 37
            },
            {
              "articleId": "project-manager-projects-read-understand-03-project-status-metadata",
              "label": 3,
              "x": 61,
              "y": 54
            },
            {
              "articleId": "project-manager-projects-read-understand-04-active-project-indicator",
              "label": 4,
              "x": 84,
              "y": 71
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
            "id": "project-manager-projects-change-control-01-project-settings",
            "title": "Project settings",
            "synonyms": [
              "project settings"
            ],
            "relatedLearningIds": [
              "registration"
            ],
            "content": {
              "definition": "Use Project settings to adjust how data is displayed or calculated on this screen.",
              "sections": [
                {
                  "heading": "What it controls",
                  "body": "Project settings changes how information is displayed or calculated in this module."
                },
                {
                  "heading": "Example",
                  "body": "Toggle the setting and compare the output before and after to confirm the effect.",
                  "type": "technical"
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
            "id": "project-manager-projects-change-control-02-sorting-filtering",
            "title": "Sorting / filtering",
            "synonyms": [
              "sorting / filtering"
            ],
            "relatedLearningIds": [
              "registration"
            ],
            "content": {
              "definition": "Use Sorting / filtering to adjust how data is displayed or calculated on this screen.",
              "sections": [
                {
                  "heading": "What it controls",
                  "body": "Sorting / filtering changes how information is displayed or calculated in this module."
                },
                {
                  "heading": "Example",
                  "body": "Toggle the setting and compare the output before and after to confirm the effect.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "project-manager-projects-change-control-01-project-settings",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "project-manager-projects-change-control-02-sorting-filtering",
              "label": 2,
              "x": 38,
              "y": 37
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
            "id": "project-manager-projects-create-manage-01-create-new-project",
            "title": "Create new project",
            "synonyms": [
              "create new project"
            ],
            "relatedLearningIds": [
              "registration"
            ],
            "content": {
              "definition": "Create new project lets you create or manage items directly in this module.",
              "sections": [
                {
                  "heading": "What you can create",
                  "body": "Create new project is used to create, duplicate, or manage items in this screen."
                },
                {
                  "heading": "Example",
                  "body": "Create a new item, rename it, and save to confirm it appears in the list.",
                  "type": "technical"
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
            "id": "project-manager-projects-create-manage-02-open-delete-archive-project",
            "title": "Open / Delete / Archive project",
            "synonyms": [
              "open / delete / archive project"
            ],
            "relatedLearningIds": [
              "registration"
            ],
            "content": {
              "definition": "Open / Delete / Archive project lets you create or manage items directly in this module.",
              "sections": [
                {
                  "heading": "What you can create",
                  "body": "Open / Delete / Archive project is used to create, duplicate, or manage items in this screen."
                },
                {
                  "heading": "Example",
                  "body": "Create a new item, rename it, and save to confirm it appears in the list.",
                  "type": "technical"
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
            "id": "project-manager-projects-create-manage-03-rename-project",
            "title": "Rename project",
            "synonyms": [
              "rename project"
            ],
            "relatedLearningIds": [
              "registration"
            ],
            "content": {
              "definition": "Rename project lets you create or manage items directly in this module.",
              "sections": [
                {
                  "heading": "What you can create",
                  "body": "Rename project is used to create, duplicate, or manage items in this screen."
                },
                {
                  "heading": "Example",
                  "body": "Create a new item, rename it, and save to confirm it appears in the list.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "project-manager-projects-create-manage-01-create-new-project",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "project-manager-projects-create-manage-02-open-delete-archive-project",
              "label": 2,
              "x": 38,
              "y": 37
            },
            {
              "articleId": "project-manager-projects-create-manage-03-rename-project",
              "label": 3,
              "x": 61,
              "y": 54
            }
          ]
        }
      },
      {
        "id": "navigate-views",
        "title": "Navigate / Views",
        "iconKey": "Layout",
        "articles": [
          {
            "id": "project-manager-projects-navigate-views-01-open-project",
            "title": "Open project",
            "synonyms": [
              "open project"
            ],
            "relatedLearningIds": [
              "registration"
            ],
            "content": {
              "definition": "Open project helps you switch views or move to related modules.",
              "sections": [
                {
                  "heading": "Where it takes you",
                  "body": "Open project takes you to a different view or module without losing context."
                },
                {
                  "heading": "Example",
                  "body": "Use it to switch from Budgeting to Financing and compare the same project data.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "project-manager-projects-navigate-views-01-open-project",
              "label": 1,
              "x": 15,
              "y": 20
            }
          ]
        }
      },
      {
        "id": "share-sync",
        "title": "Share / Sync",
        "iconKey": "RefreshCw",
        "articles": [
          {
            "id": "project-manager-projects-share-sync-01-sync-share-indikatoren",
            "title": "Sync/Share-Indikatoren",
            "synonyms": [
              "sync/share-indikatoren"
            ],
            "relatedLearningIds": [
              "registration"
            ],
            "content": {
              "definition": "Sync/Share-Indikatoren is used to share, export, or sync your data.",
              "sections": [
                {
                  "heading": "What it does",
                  "body": "Sync/Share-Indikatoren is used to share, export, or sync data with collaborators or files."
                },
                {
                  "heading": "Example",
                  "body": "Export the current dataset and verify that the latest changes are included.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "project-manager-projects-share-sync-01-sync-share-indikatoren",
              "label": 1,
              "x": 15,
              "y": 20
            }
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
            "synonyms": [
              "financing grid values"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Financing grid values helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "Financing grid values is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
            "id": "financing-general-ui-read-understand-02-status-column",
            "title": "Status column",
            "synonyms": [
              "status column"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Status column helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "Status column is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
            "id": "financing-general-ui-read-understand-03-installments",
            "title": "Installments",
            "synonyms": [
              "installments"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Installments helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "Installments is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
            "id": "financing-general-ui-read-understand-04-totals-summary",
            "title": "Totals/Summary",
            "synonyms": [
              "totals/summary"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Totals/Summary helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "financing-general-ui-read-understand-01-financing-grid-values",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "financing-general-ui-read-understand-02-status-column",
              "label": 2,
              "x": 38,
              "y": 37
            },
            {
              "articleId": "financing-general-ui-read-understand-03-installments",
              "label": 3,
              "x": 61,
              "y": 54
            },
            {
              "articleId": "financing-general-ui-read-understand-04-totals-summary",
              "label": 4,
              "x": 84,
              "y": 71
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
            "id": "financing-general-ui-change-control-01-display-currency-dropdown",
            "title": "Display Currency dropdown",
            "synonyms": [
              "display currency dropdown"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Display Currency dropdown to adjust how data is displayed or calculated on this screen.",
              "sections": [
                {
                  "heading": "What it controls",
                  "body": "Display Currency dropdown changes how information is displayed or calculated in this module."
                },
                {
                  "heading": "Example",
                  "body": "Toggle the setting and compare the output before and after to confirm the effect.",
                  "type": "technical"
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
            "id": "financing-general-ui-change-control-02-column-visibility",
            "title": "Column visibility",
            "synonyms": [
              "column visibility"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Column visibility to adjust how data is displayed or calculated on this screen.",
              "sections": [
                {
                  "heading": "What it controls",
                  "body": "Column visibility changes how information is displayed or calculated in this module."
                },
                {
                  "heading": "Example",
                  "body": "Toggle the setting and compare the output before and after to confirm the effect.",
                  "type": "technical"
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
            "id": "financing-general-ui-change-control-03-filters-search",
            "title": "Filters / Search",
            "synonyms": [
              "filters / search"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Filters / Search to adjust how data is displayed or calculated on this screen.",
              "sections": [
                {
                  "heading": "What it controls",
                  "body": "Filters / Search changes how information is displayed or calculated in this module."
                },
                {
                  "heading": "Example",
                  "body": "Toggle the setting and compare the output before and after to confirm the effect.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "financing-general-ui-change-control-01-display-currency-dropdown",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "financing-general-ui-change-control-02-column-visibility",
              "label": 2,
              "x": 38,
              "y": 37
            },
            {
              "articleId": "financing-general-ui-change-control-03-filters-search",
              "label": 3,
              "x": 61,
              "y": 54
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
            "id": "financing-general-ui-create-manage-01-new-financing-plan",
            "title": "New financing plan",
            "synonyms": [
              "new financing plan"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "New financing plan lets you create or manage items directly in this module.",
              "sections": [
                {
                  "heading": "What you can create",
                  "body": "New financing plan is used to create, duplicate, or manage items in this screen."
                },
                {
                  "heading": "Example",
                  "body": "Create a new item, rename it, and save to confirm it appears in the list.",
                  "type": "technical"
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
            "id": "financing-general-ui-create-manage-02-copy-financing-plan",
            "title": "Copy financing plan",
            "synonyms": [
              "copy financing plan"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Copy financing plan lets you create or manage items directly in this module.",
              "sections": [
                {
                  "heading": "What you can create",
                  "body": "Copy financing plan is used to create, duplicate, or manage items in this screen."
                },
                {
                  "heading": "Example",
                  "body": "Create a new item, rename it, and save to confirm it appears in the list.",
                  "type": "technical"
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
            "id": "financing-general-ui-create-manage-03-delete-financing-plan",
            "title": "Delete financing plan",
            "synonyms": [
              "delete financing plan"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Delete financing plan lets you create or manage items directly in this module.",
              "sections": [
                {
                  "heading": "What you can create",
                  "body": "Delete financing plan is used to create, duplicate, or manage items in this screen."
                },
                {
                  "heading": "Example",
                  "body": "Create a new item, rename it, and save to confirm it appears in the list.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "financing-general-ui-create-manage-01-new-financing-plan",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "financing-general-ui-create-manage-02-copy-financing-plan",
              "label": 2,
              "x": 38,
              "y": 37
            },
            {
              "articleId": "financing-general-ui-create-manage-03-delete-financing-plan",
              "label": 3,
              "x": 61,
              "y": 54
            }
          ]
        }
      },
      {
        "id": "navigate-views",
        "title": "Navigate / Views",
        "iconKey": "Layout",
        "articles": [
          {
            "id": "financing-general-ui-navigate-views-01-module-navigation",
            "title": "Module navigation",
            "synonyms": [
              "module navigation"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Module navigation helps you switch views or move to related modules.",
              "sections": [
                {
                  "heading": "Where it takes you",
                  "body": "Module navigation takes you to a different view or module without losing context."
                },
                {
                  "heading": "Example",
                  "body": "Use it to switch from Budgeting to Financing and compare the same project data.",
                  "type": "technical"
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
            "id": "financing-general-ui-navigate-views-02-dashboard-view",
            "title": "Dashboard view",
            "synonyms": [
              "dashboard view"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Dashboard view helps you switch views or move to related modules.",
              "sections": [
                {
                  "heading": "Where it takes you",
                  "body": "Dashboard view takes you to a different view or module without losing context."
                },
                {
                  "heading": "Example",
                  "body": "Use it to switch from Budgeting to Financing and compare the same project data.",
                  "type": "technical"
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
            "id": "financing-general-ui-navigate-views-03-timeline-view",
            "title": "Timeline view",
            "synonyms": [
              "timeline view"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Timeline view helps you switch views or move to related modules.",
              "sections": [
                {
                  "heading": "Where it takes you",
                  "body": "Timeline view takes you to a different view or module without losing context."
                },
                {
                  "heading": "Example",
                  "body": "Use it to switch from Budgeting to Financing and compare the same project data.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "financing-general-ui-navigate-views-01-module-navigation",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "financing-general-ui-navigate-views-02-dashboard-view",
              "label": 2,
              "x": 38,
              "y": 37
            },
            {
              "articleId": "financing-general-ui-navigate-views-03-timeline-view",
              "label": 3,
              "x": 61,
              "y": 54
            }
          ]
        }
      },
      {
        "id": "share-sync",
        "title": "Share / Sync",
        "iconKey": "RefreshCw",
        "articles": [
          {
            "id": "financing-general-ui-share-sync-01-share-dataset-button",
            "title": "Share dataset button",
            "synonyms": [
              "share dataset button"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Share dataset button is used to share, export, or sync your data.",
              "sections": [
                {
                  "heading": "What it does",
                  "body": "Share dataset button is used to share, export, or sync data with collaborators or files."
                },
                {
                  "heading": "Example",
                  "body": "Export the current dataset and verify that the latest changes are included.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "financing-general-ui-share-sync-01-share-dataset-button",
              "label": 1,
              "x": 15,
              "y": 20
            }
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
            "synonyms": [
              "cash flow grid"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Cash flow grid helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "Cash flow grid is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
            "id": "cash-flow-general-ui-read-understand-02-income-expense-rows",
            "title": "Income/Expense rows",
            "synonyms": [
              "income/expense rows"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Income/Expense rows helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "Income/Expense rows is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
            "id": "cash-flow-general-ui-read-understand-03-totals-summary",
            "title": "Totals/summary",
            "synonyms": [
              "totals/summary"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Totals/summary helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "Totals/summary is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
            "id": "cash-flow-general-ui-read-understand-04-timeline-markers",
            "title": "Timeline markers",
            "synonyms": [
              "timeline markers"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Timeline markers helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "cash-flow-general-ui-read-understand-01-cash-flow-grid",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "cash-flow-general-ui-read-understand-02-income-expense-rows",
              "label": 2,
              "x": 38,
              "y": 37
            },
            {
              "articleId": "cash-flow-general-ui-read-understand-03-totals-summary",
              "label": 3,
              "x": 61,
              "y": 54
            },
            {
              "articleId": "cash-flow-general-ui-read-understand-04-timeline-markers",
              "label": 4,
              "x": 84,
              "y": 71
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
            "id": "cash-flow-general-ui-change-control-01-time-scale",
            "title": "Time scale",
            "synonyms": [
              "time scale"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Time scale to adjust how data is displayed or calculated on this screen.",
              "sections": [
                {
                  "heading": "What it controls",
                  "body": "Time scale changes how information is displayed or calculated in this module."
                },
                {
                  "heading": "Example",
                  "body": "Toggle the setting and compare the output before and after to confirm the effect.",
                  "type": "technical"
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
            "id": "cash-flow-general-ui-change-control-02-filters-search",
            "title": "Filters / Search",
            "synonyms": [
              "filters / search"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Filters / Search to adjust how data is displayed or calculated on this screen.",
              "sections": [
                {
                  "heading": "What it controls",
                  "body": "Filters / Search changes how information is displayed or calculated in this module."
                },
                {
                  "heading": "Example",
                  "body": "Toggle the setting and compare the output before and after to confirm the effect.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "cash-flow-general-ui-change-control-01-time-scale",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "cash-flow-general-ui-change-control-02-filters-search",
              "label": 2,
              "x": 38,
              "y": 37
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
            "id": "cash-flow-general-ui-create-manage-01-new-cash-flow-plan",
            "title": "New cash flow plan",
            "synonyms": [
              "new cash flow plan"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "New cash flow plan lets you create or manage items directly in this module.",
              "sections": [
                {
                  "heading": "What you can create",
                  "body": "New cash flow plan is used to create, duplicate, or manage items in this screen."
                },
                {
                  "heading": "Example",
                  "body": "Create a new item, rename it, and save to confirm it appears in the list.",
                  "type": "technical"
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
            "id": "cash-flow-general-ui-create-manage-02-copy-cash-flow-plan",
            "title": "Copy cash flow plan",
            "synonyms": [
              "copy cash flow plan"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Copy cash flow plan lets you create or manage items directly in this module.",
              "sections": [
                {
                  "heading": "What you can create",
                  "body": "Copy cash flow plan is used to create, duplicate, or manage items in this screen."
                },
                {
                  "heading": "Example",
                  "body": "Create a new item, rename it, and save to confirm it appears in the list.",
                  "type": "technical"
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
            "id": "cash-flow-general-ui-create-manage-03-delete-cash-flow-plan",
            "title": "Delete cash flow plan",
            "synonyms": [
              "delete cash flow plan"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Delete cash flow plan lets you create or manage items directly in this module.",
              "sections": [
                {
                  "heading": "What you can create",
                  "body": "Delete cash flow plan is used to create, duplicate, or manage items in this screen."
                },
                {
                  "heading": "Example",
                  "body": "Create a new item, rename it, and save to confirm it appears in the list.",
                  "type": "technical"
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
            "id": "cash-flow-general-ui-create-manage-04-add-milestone-work-phase",
            "title": "Add milestone / work phase",
            "synonyms": [
              "add milestone / work phase"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Add milestone / work phase lets you create or manage items directly in this module.",
              "sections": []
            }
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "cash-flow-general-ui-create-manage-01-new-cash-flow-plan",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "cash-flow-general-ui-create-manage-02-copy-cash-flow-plan",
              "label": 2,
              "x": 38,
              "y": 37
            },
            {
              "articleId": "cash-flow-general-ui-create-manage-03-delete-cash-flow-plan",
              "label": 3,
              "x": 61,
              "y": 54
            },
            {
              "articleId": "cash-flow-general-ui-create-manage-04-add-milestone-work-phase",
              "label": 4,
              "x": 84,
              "y": 71
            }
          ]
        }
      },
      {
        "id": "navigate-views",
        "title": "Navigate / Views",
        "iconKey": "Layout",
        "articles": [
          {
            "id": "cash-flow-general-ui-navigate-views-01-module-navigation",
            "title": "Module navigation",
            "synonyms": [
              "module navigation"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Module navigation helps you switch views or move to related modules.",
              "sections": [
                {
                  "heading": "Where it takes you",
                  "body": "Module navigation takes you to a different view or module without losing context."
                },
                {
                  "heading": "Example",
                  "body": "Use it to switch from Budgeting to Financing and compare the same project data.",
                  "type": "technical"
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
            "id": "cash-flow-general-ui-navigate-views-02-dashboard-view",
            "title": "Dashboard view",
            "synonyms": [
              "dashboard view"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Dashboard view helps you switch views or move to related modules.",
              "sections": [
                {
                  "heading": "Where it takes you",
                  "body": "Dashboard view takes you to a different view or module without losing context."
                },
                {
                  "heading": "Example",
                  "body": "Use it to switch from Budgeting to Financing and compare the same project data.",
                  "type": "technical"
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
            "id": "cash-flow-general-ui-navigate-views-03-timeline-view",
            "title": "Timeline view",
            "synonyms": [
              "timeline view"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Timeline view helps you switch views or move to related modules.",
              "sections": [
                {
                  "heading": "Where it takes you",
                  "body": "Timeline view takes you to a different view or module without losing context."
                },
                {
                  "heading": "Example",
                  "body": "Use it to switch from Budgeting to Financing and compare the same project data.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "cash-flow-general-ui-navigate-views-01-module-navigation",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "cash-flow-general-ui-navigate-views-02-dashboard-view",
              "label": 2,
              "x": 38,
              "y": 37
            },
            {
              "articleId": "cash-flow-general-ui-navigate-views-03-timeline-view",
              "label": 3,
              "x": 61,
              "y": 54
            }
          ]
        }
      },
      {
        "id": "share-sync",
        "title": "Share / Sync",
        "iconKey": "RefreshCw",
        "articles": [
          {
            "id": "cash-flow-general-ui-share-sync-01-share-dataset-button",
            "title": "Share dataset button",
            "synonyms": [
              "share dataset button"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Share dataset button is used to share, export, or sync your data.",
              "sections": [
                {
                  "heading": "What it does",
                  "body": "Share dataset button is used to share, export, or sync data with collaborators or files."
                },
                {
                  "heading": "Example",
                  "body": "Export the current dataset and verify that the latest changes are included.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "cash-flow-general-ui-share-sync-01-share-dataset-button",
              "label": 1,
              "x": 15,
              "y": 20
            }
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
            "synonyms": [
              "cost control grid"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Cost control grid helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "Cost control grid is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
            "id": "cost-control-general-ui-read-understand-02-category-totals-column-footers",
            "title": "Category totals / column footers",
            "synonyms": [
              "category totals / column footers"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Category totals / column footers helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "Category totals / column footers is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
            "id": "cost-control-general-ui-read-understand-03-cost-items-area",
            "title": "Cost items area",
            "synonyms": [
              "cost items area"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Cost items area helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "Cost items area is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
            "id": "cost-control-general-ui-read-understand-04-prediction-deviation-indicators",
            "title": "Prediction / Deviation indicators",
            "synonyms": [
              "prediction / deviation indicators"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Prediction / Deviation indicators helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "cost-control-general-ui-read-understand-01-cost-control-grid",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "cost-control-general-ui-read-understand-02-category-totals-column-footers",
              "label": 2,
              "x": 38,
              "y": 37
            },
            {
              "articleId": "cost-control-general-ui-read-understand-03-cost-items-area",
              "label": 3,
              "x": 61,
              "y": 54
            },
            {
              "articleId": "cost-control-general-ui-read-understand-04-prediction-deviation-indicators",
              "label": 4,
              "x": 84,
              "y": 71
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
            "id": "cost-control-general-ui-change-control-01-display-currency-dropdown",
            "title": "Display Currency dropdown",
            "synonyms": [
              "display currency dropdown"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Display Currency dropdown to adjust how data is displayed or calculated on this screen.",
              "sections": [
                {
                  "heading": "What it controls",
                  "body": "Display Currency dropdown changes how information is displayed or calculated in this module."
                },
                {
                  "heading": "Example",
                  "body": "Toggle the setting and compare the output before and after to confirm the effect.",
                  "type": "technical"
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
            "id": "cost-control-general-ui-change-control-02-toggle-numbers-vs-formulas",
            "title": "Toggle numbers vs formulas",
            "synonyms": [
              "toggle numbers vs formulas"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Toggle numbers vs formulas to adjust how data is displayed or calculated on this screen.",
              "sections": [
                {
                  "heading": "What it controls",
                  "body": "Toggle numbers vs formulas changes how information is displayed or calculated in this module."
                },
                {
                  "heading": "Example",
                  "body": "Toggle the setting and compare the output before and after to confirm the effect.",
                  "type": "technical"
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
            "id": "cost-control-general-ui-change-control-03-filters-search",
            "title": "Filters / Search",
            "synonyms": [
              "filters / search"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Filters / Search to adjust how data is displayed or calculated on this screen.",
              "sections": [
                {
                  "heading": "What it controls",
                  "body": "Filters / Search changes how information is displayed or calculated in this module."
                },
                {
                  "heading": "Example",
                  "body": "Toggle the setting and compare the output before and after to confirm the effect.",
                  "type": "technical"
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
            "id": "cost-control-general-ui-change-control-04-additional-columns",
            "title": "Additional columns",
            "synonyms": [
              "additional columns"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Additional columns to adjust how data is displayed or calculated on this screen.",
              "sections": []
            }
          },
          {
            "id": "cost-control-general-ui-change-control-05-consolidate-toggle",
            "title": "Consolidate toggle",
            "synonyms": [
              "consolidate toggle"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Consolidate toggle to adjust how data is displayed or calculated on this screen.",
              "sections": []
            }
          },
          {
            "id": "cost-control-general-ui-change-control-06-recalculate-toggle",
            "title": "Recalculate toggle",
            "synonyms": [
              "recalculate toggle"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Recalculate toggle to adjust how data is displayed or calculated on this screen.",
              "sections": []
            }
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "cost-control-general-ui-change-control-01-display-currency-dropdown",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "cost-control-general-ui-change-control-02-toggle-numbers-vs-formulas",
              "label": 2,
              "x": 38,
              "y": 37
            },
            {
              "articleId": "cost-control-general-ui-change-control-03-filters-search",
              "label": 3,
              "x": 61,
              "y": 54
            },
            {
              "articleId": "cost-control-general-ui-change-control-04-additional-columns",
              "label": 4,
              "x": 84,
              "y": 71
            },
            {
              "articleId": "cost-control-general-ui-change-control-05-consolidate-toggle",
              "label": 5,
              "x": 37,
              "y": 28
            },
            {
              "articleId": "cost-control-general-ui-change-control-06-recalculate-toggle",
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
            "id": "cost-control-general-ui-create-manage-01-new-cost-control-set",
            "title": "New cost control set",
            "synonyms": [
              "new cost control set"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "New cost control set lets you create or manage items directly in this module.",
              "sections": [
                {
                  "heading": "What you can create",
                  "body": "New cost control set is used to create, duplicate, or manage items in this screen."
                },
                {
                  "heading": "Example",
                  "body": "Create a new item, rename it, and save to confirm it appears in the list.",
                  "type": "technical"
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
            "id": "cost-control-general-ui-create-manage-02-copy-cost-control-set",
            "title": "Copy cost control set",
            "synonyms": [
              "copy cost control set"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Copy cost control set lets you create or manage items directly in this module.",
              "sections": [
                {
                  "heading": "What you can create",
                  "body": "Copy cost control set is used to create, duplicate, or manage items in this screen."
                },
                {
                  "heading": "Example",
                  "body": "Create a new item, rename it, and save to confirm it appears in the list.",
                  "type": "technical"
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
            "id": "cost-control-general-ui-create-manage-03-delete-cost-control-set",
            "title": "Delete cost control set",
            "synonyms": [
              "delete cost control set"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Delete cost control set lets you create or manage items directly in this module.",
              "sections": [
                {
                  "heading": "What you can create",
                  "body": "Delete cost control set is used to create, duplicate, or manage items in this screen."
                },
                {
                  "heading": "Example",
                  "body": "Create a new item, rename it, and save to confirm it appears in the list.",
                  "type": "technical"
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
            "id": "cost-control-general-ui-create-manage-04-add-cost-item-row",
            "title": "Add cost item row",
            "synonyms": [
              "add cost item row"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Add cost item row lets you create or manage items directly in this module.",
              "sections": []
            }
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "cost-control-general-ui-create-manage-01-new-cost-control-set",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "cost-control-general-ui-create-manage-02-copy-cost-control-set",
              "label": 2,
              "x": 38,
              "y": 37
            },
            {
              "articleId": "cost-control-general-ui-create-manage-03-delete-cost-control-set",
              "label": 3,
              "x": 61,
              "y": 54
            },
            {
              "articleId": "cost-control-general-ui-create-manage-04-add-cost-item-row",
              "label": 4,
              "x": 84,
              "y": 71
            }
          ]
        }
      },
      {
        "id": "navigate-views",
        "title": "Navigate / Views",
        "iconKey": "Layout",
        "articles": [
          {
            "id": "cost-control-general-ui-navigate-views-01-module-navigation",
            "title": "Module navigation",
            "synonyms": [
              "module navigation"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Module navigation helps you switch views or move to related modules.",
              "sections": [
                {
                  "heading": "Where it takes you",
                  "body": "Module navigation takes you to a different view or module without losing context."
                },
                {
                  "heading": "Example",
                  "body": "Use it to switch from Budgeting to Financing and compare the same project data.",
                  "type": "technical"
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
            "id": "cost-control-general-ui-navigate-views-02-dashboard-view",
            "title": "Dashboard view",
            "synonyms": [
              "dashboard view"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Dashboard view helps you switch views or move to related modules.",
              "sections": [
                {
                  "heading": "Where it takes you",
                  "body": "Dashboard view takes you to a different view or module without losing context."
                },
                {
                  "heading": "Example",
                  "body": "Use it to switch from Budgeting to Financing and compare the same project data.",
                  "type": "technical"
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
            "id": "cost-control-general-ui-navigate-views-03-timeline-view",
            "title": "Timeline view",
            "synonyms": [
              "timeline view"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Timeline view helps you switch views or move to related modules.",
              "sections": [
                {
                  "heading": "Where it takes you",
                  "body": "Timeline view takes you to a different view or module without losing context."
                },
                {
                  "heading": "Example",
                  "body": "Use it to switch from Budgeting to Financing and compare the same project data.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "cost-control-general-ui-navigate-views-01-module-navigation",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "cost-control-general-ui-navigate-views-02-dashboard-view",
              "label": 2,
              "x": 38,
              "y": 37
            },
            {
              "articleId": "cost-control-general-ui-navigate-views-03-timeline-view",
              "label": 3,
              "x": 61,
              "y": 54
            }
          ]
        }
      },
      {
        "id": "share-sync",
        "title": "Share / Sync",
        "iconKey": "RefreshCw",
        "articles": [
          {
            "id": "cost-control-general-ui-share-sync-01-share-dataset-button",
            "title": "Share dataset button",
            "synonyms": [
              "share dataset button"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Share dataset button is used to share, export, or sync your data.",
              "sections": [
                {
                  "heading": "What it does",
                  "body": "Share dataset button is used to share, export, or sync data with collaborators or files."
                },
                {
                  "heading": "Example",
                  "body": "Export the current dataset and verify that the latest changes are included.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "cost-control-general-ui-share-sync-01-share-dataset-button",
              "label": 1,
              "x": 15,
              "y": 20
            }
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
            "synonyms": [
              "members list / roles"
            ],
            "relatedLearningIds": [
              "registration"
            ],
            "content": {
              "definition": "Members list / roles helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "Members list / roles is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
            "id": "admin-project-management-read-understand-02-project-access-status",
            "title": "Project access status",
            "synonyms": [
              "project access status"
            ],
            "relatedLearningIds": [
              "registration"
            ],
            "content": {
              "definition": "Project access status helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "Project access status is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
            "id": "admin-project-management-read-understand-03-share-mode-access-state",
            "title": "Share mode / access state",
            "synonyms": [
              "share mode / access state"
            ],
            "relatedLearningIds": [
              "registration"
            ],
            "content": {
              "definition": "Share mode / access state helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "Share mode / access state is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "admin-project-management-read-understand-01-members-list-roles",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "admin-project-management-read-understand-02-project-access-status",
              "label": 2,
              "x": 38,
              "y": 37
            },
            {
              "articleId": "admin-project-management-read-understand-03-share-mode-access-state",
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
            "id": "admin-project-management-change-control-01-permissions-role-changes",
            "title": "Permissions / role changes",
            "synonyms": [
              "permissions / role changes"
            ],
            "relatedLearningIds": [
              "registration"
            ],
            "content": {
              "definition": "Use Permissions / role changes to adjust how data is displayed or calculated on this screen.",
              "sections": [
                {
                  "heading": "What it controls",
                  "body": "Permissions / role changes changes how information is displayed or calculated in this module."
                },
                {
                  "heading": "Example",
                  "body": "Toggle the setting and compare the output before and after to confirm the effect.",
                  "type": "technical"
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
            "id": "admin-project-management-change-control-02-sharing-settings",
            "title": "Sharing settings",
            "synonyms": [
              "sharing settings"
            ],
            "relatedLearningIds": [
              "registration"
            ],
            "content": {
              "definition": "Use Sharing settings to adjust how data is displayed or calculated on this screen.",
              "sections": [
                {
                  "heading": "What it controls",
                  "body": "Sharing settings changes how information is displayed or calculated in this module."
                },
                {
                  "heading": "Example",
                  "body": "Toggle the setting and compare the output before and after to confirm the effect.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "admin-project-management-change-control-01-permissions-role-changes",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "admin-project-management-change-control-02-sharing-settings",
              "label": 2,
              "x": 38,
              "y": 37
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
            "id": "admin-project-management-create-manage-01-invite-member",
            "title": "Invite member",
            "synonyms": [
              "invite member"
            ],
            "relatedLearningIds": [
              "registration"
            ],
            "content": {
              "definition": "Invite member lets you create or manage items directly in this module.",
              "sections": [
                {
                  "heading": "What you can create",
                  "body": "Invite member is used to create, duplicate, or manage items in this screen."
                },
                {
                  "heading": "Example",
                  "body": "Create a new item, rename it, and save to confirm it appears in the list.",
                  "type": "technical"
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
            "id": "admin-project-management-create-manage-02-remove-member",
            "title": "Remove member",
            "synonyms": [
              "remove member"
            ],
            "relatedLearningIds": [
              "registration"
            ],
            "content": {
              "definition": "Remove member lets you create or manage items directly in this module.",
              "sections": [
                {
                  "heading": "What you can create",
                  "body": "Remove member is used to create, duplicate, or manage items in this screen."
                },
                {
                  "heading": "Example",
                  "body": "Create a new item, rename it, and save to confirm it appears in the list.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "admin-project-management-create-manage-01-invite-member",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "admin-project-management-create-manage-02-remove-member",
              "label": 2,
              "x": 38,
              "y": 37
            }
          ]
        }
      },
      {
        "id": "navigate-views",
        "title": "Navigate / Views",
        "iconKey": "Layout",
        "articles": [
          {
            "id": "admin-project-management-navigate-views-01-back-to-project",
            "title": "Back to project",
            "synonyms": [
              "back to project"
            ],
            "relatedLearningIds": [
              "registration"
            ],
            "content": {
              "definition": "Back to project helps you switch views or move to related modules.",
              "sections": [
                {
                  "heading": "Where it takes you",
                  "body": "Back to project takes you to a different view or module without losing context."
                },
                {
                  "heading": "Example",
                  "body": "Use it to switch from Budgeting to Financing and compare the same project data.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "admin-project-management-navigate-views-01-back-to-project",
              "label": 1,
              "x": 15,
              "y": 20
            }
          ]
        }
      },
      {
        "id": "share-sync",
        "title": "Share / Sync",
        "iconKey": "RefreshCw",
        "articles": [
          {
            "id": "admin-project-management-share-sync-01-share-revoke-access",
            "title": "Share / revoke access",
            "synonyms": [
              "share / revoke access"
            ],
            "relatedLearningIds": [
              "registration"
            ],
            "content": {
              "definition": "Share / revoke access is used to share, export, or sync your data.",
              "sections": [
                {
                  "heading": "What it does",
                  "body": "Share / revoke access is used to share, export, or sync data with collaborators or files."
                },
                {
                  "heading": "Example",
                  "body": "Export the current dataset and verify that the latest changes are included.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "admin-project-management-share-sync-01-share-revoke-access",
              "label": 1,
              "x": 15,
              "y": 20
            }
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
            "synonyms": [
              "export/print options"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Export/print options helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "Export/print options is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
            "id": "printing-sharing-read-understand-02-active-dataset-selection",
            "title": "Active dataset selection",
            "synonyms": [
              "active dataset selection"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Active dataset selection helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "Active dataset selection is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "printing-sharing-read-understand-01-export-print-options",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "printing-sharing-read-understand-02-active-dataset-selection",
              "label": 2,
              "x": 38,
              "y": 37
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
            "id": "printing-sharing-change-control-01-file-format-options",
            "title": "File format options",
            "synonyms": [
              "file format options"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use File format options to adjust how data is displayed or calculated on this screen.",
              "sections": [
                {
                  "heading": "What it controls",
                  "body": "File format options changes how information is displayed or calculated in this module."
                },
                {
                  "heading": "Example",
                  "body": "Toggle the setting and compare the output before and after to confirm the effect.",
                  "type": "technical"
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
            "id": "printing-sharing-change-control-02-paper-size-orientation",
            "title": "Paper size / orientation",
            "synonyms": [
              "paper size / orientation"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Paper size / orientation to adjust how data is displayed or calculated on this screen.",
              "sections": [
                {
                  "heading": "What it controls",
                  "body": "Paper size / orientation changes how information is displayed or calculated in this module."
                },
                {
                  "heading": "Example",
                  "body": "Toggle the setting and compare the output before and after to confirm the effect.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "printing-sharing-change-control-01-file-format-options",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "printing-sharing-change-control-02-paper-size-orientation",
              "label": 2,
              "x": 38,
              "y": 37
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
            "id": "printing-sharing-create-manage-01-export-to-excel",
            "title": "Export to Excel",
            "synonyms": [
              "export to excel"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Export to Excel lets you create or manage items directly in this module.",
              "sections": [
                {
                  "heading": "What you can create",
                  "body": "Export to Excel is used to create, duplicate, or manage items in this screen."
                },
                {
                  "heading": "Example",
                  "body": "Create a new item, rename it, and save to confirm it appears in the list.",
                  "type": "technical"
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
            "id": "printing-sharing-create-manage-02-print-to-pdf",
            "title": "Print to PDF",
            "synonyms": [
              "print to pdf"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Print to PDF lets you create or manage items directly in this module.",
              "sections": [
                {
                  "heading": "What you can create",
                  "body": "Print to PDF is used to create, duplicate, or manage items in this screen."
                },
                {
                  "heading": "Example",
                  "body": "Create a new item, rename it, and save to confirm it appears in the list.",
                  "type": "technical"
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
            "id": "printing-sharing-create-manage-03-save-template-export-file",
            "title": "Save template / export file",
            "synonyms": [
              "save template / export file"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Save template / export file lets you create or manage items directly in this module.",
              "sections": [
                {
                  "heading": "What you can create",
                  "body": "Save template / export file is used to create, duplicate, or manage items in this screen."
                },
                {
                  "heading": "Example",
                  "body": "Create a new item, rename it, and save to confirm it appears in the list.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "printing-sharing-create-manage-01-export-to-excel",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "printing-sharing-create-manage-02-print-to-pdf",
              "label": 2,
              "x": 38,
              "y": 37
            },
            {
              "articleId": "printing-sharing-create-manage-03-save-template-export-file",
              "label": 3,
              "x": 61,
              "y": 54
            }
          ]
        }
      },
      {
        "id": "navigate-views",
        "title": "Navigate / Views",
        "iconKey": "Layout",
        "articles": [
          {
            "id": "printing-sharing-navigate-views-01-return-to-module",
            "title": "Return to module",
            "synonyms": [
              "return to module"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Return to module helps you switch views or move to related modules.",
              "sections": [
                {
                  "heading": "Where it takes you",
                  "body": "Return to module takes you to a different view or module without losing context."
                },
                {
                  "heading": "Example",
                  "body": "Use it to switch from Budgeting to Financing and compare the same project data.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "printing-sharing-navigate-views-01-return-to-module",
              "label": 1,
              "x": 15,
              "y": 20
            }
          ]
        }
      },
      {
        "id": "share-sync",
        "title": "Share / Sync",
        "iconKey": "RefreshCw",
        "articles": [
          {
            "id": "printing-sharing-share-sync-01-share-exported-files-externally",
            "title": "Share exported files externally",
            "synonyms": [
              "share exported files externally"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Share exported files externally is used to share, export, or sync your data.",
              "sections": [
                {
                  "heading": "What it does",
                  "body": "Share exported files externally is used to share, export, or sync data with collaborators or files."
                },
                {
                  "heading": "Example",
                  "body": "Export the current dataset and verify that the latest changes are included.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "printing-sharing-share-sync-01-share-exported-files-externally",
              "label": 1,
              "x": 15,
              "y": 20
            }
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
            "synonyms": [
              "current plan / status"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Current plan / status helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "Current plan / status is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
            "id": "licensing-read-understand-02-billing-cycle-validity",
            "title": "Billing cycle / validity",
            "synonyms": [
              "billing cycle / validity"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Billing cycle / validity helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "Billing cycle / validity is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "licensing-read-understand-01-current-plan-status",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "licensing-read-understand-02-billing-cycle-validity",
              "label": 2,
              "x": 38,
              "y": 37
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
            "id": "licensing-change-control-01-upgrade-downgrade-options",
            "title": "Upgrade / downgrade options",
            "synonyms": [
              "upgrade / downgrade options"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Upgrade / downgrade options to adjust how data is displayed or calculated on this screen.",
              "sections": [
                {
                  "heading": "What it controls",
                  "body": "Upgrade / downgrade options changes how information is displayed or calculated in this module."
                },
                {
                  "heading": "Example",
                  "body": "Toggle the setting and compare the output before and after to confirm the effect.",
                  "type": "technical"
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
            "id": "licensing-change-control-02-payment-method-billing-details",
            "title": "Payment method / billing details",
            "synonyms": [
              "payment method / billing details"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Payment method / billing details to adjust how data is displayed or calculated on this screen.",
              "sections": [
                {
                  "heading": "What it controls",
                  "body": "Payment method / billing details changes how information is displayed or calculated in this module."
                },
                {
                  "heading": "Example",
                  "body": "Toggle the setting and compare the output before and after to confirm the effect.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "licensing-change-control-01-upgrade-downgrade-options",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "licensing-change-control-02-payment-method-billing-details",
              "label": 2,
              "x": 38,
              "y": 37
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
            "id": "licensing-create-manage-01-start-cancel-subscription",
            "title": "Start / cancel subscription",
            "synonyms": [
              "start / cancel subscription"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Start / cancel subscription lets you create or manage items directly in this module.",
              "sections": [
                {
                  "heading": "What you can create",
                  "body": "Start / cancel subscription is used to create, duplicate, or manage items in this screen."
                },
                {
                  "heading": "Example",
                  "body": "Create a new item, rename it, and save to confirm it appears in the list.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "licensing-create-manage-01-start-cancel-subscription",
              "label": 1,
              "x": 15,
              "y": 20
            }
          ]
        }
      },
      {
        "id": "navigate-views",
        "title": "Navigate / Views",
        "iconKey": "Layout",
        "articles": [
          {
            "id": "licensing-navigate-views-01-go-to-billing-portal",
            "title": "Go to billing portal",
            "synonyms": [
              "go to billing portal"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Go to billing portal helps you switch views or move to related modules.",
              "sections": [
                {
                  "heading": "Where it takes you",
                  "body": "Go to billing portal takes you to a different view or module without losing context."
                },
                {
                  "heading": "Example",
                  "body": "Use it to switch from Budgeting to Financing and compare the same project data.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "licensing-navigate-views-01-go-to-billing-portal",
              "label": 1,
              "x": 15,
              "y": 20
            }
          ]
        }
      },
      {
        "id": "share-sync",
        "title": "Share / Sync",
        "iconKey": "RefreshCw",
        "articles": [
          {
            "id": "licensing-share-sync-01-license-sync-status-updates",
            "title": "license sync / status updates",
            "synonyms": [
              "license sync / status updates"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "license sync / status updates is used to share, export, or sync your data.",
              "sections": [
                {
                  "heading": "What it does",
                  "body": "license sync / status updates is used to share, export, or sync data with collaborators or files."
                },
                {
                  "heading": "Example",
                  "body": "Export the current dataset and verify that the latest changes are included.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "licensing-share-sync-01-license-sync-status-updates",
              "label": 1,
              "x": 15,
              "y": 20
            }
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
            "synonyms": [
              "faq list / answers"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "FAQ list / answers helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "FAQ list / answers is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
            "id": "faq-read-understand-02-faq-categories",
            "title": "FAQ categories",
            "synonyms": [
              "faq categories"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "FAQ categories helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "FAQ categories is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
            "id": "faq-read-understand-03-example-topics-keyboard-shortcuts-formulas-copy-paste-system-requirements-apple-m1-setup",
            "title": "Example topics: keyboard shortcuts, formulas, copy & paste, system requirements, Apple M1 setup",
            "synonyms": [
              "example topics: keyboard shortcuts, formulas, copy & paste, system requirements, apple m1 setup"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Example topics: keyboard shortcuts, formulas, copy & paste, system requirements, Apple M1 setup helps you interpret the current state of your data on this screen.",
              "sections": [
                {
                  "heading": "What it shows",
                  "body": "Example topics: keyboard shortcuts, formulas, copy & paste, system requirements, Apple M1 setup is a read-only indicator that helps you interpret the current state of your work."
                },
                {
                  "heading": "Example",
                  "body": "Check this area after applying filters to verify what is included in your view.",
                  "type": "technical"
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
            "id": "faq-read-understand-04-lizenz-account",
            "title": "Lizenz & Account:",
            "synonyms": [
              "lizenz & account:"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Lizenz & Account: helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          },
          {
            "id": "faq-read-understand-05-ich-m-chte-meine-lizenz-upraden-downgraden",
            "title": "Ich möchte meine Lizenz upraden/downgraden",
            "synonyms": [
              "ich möchte meine lizenz upraden/downgraden"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Ich möchte meine Lizenz upraden/downgraden helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          },
          {
            "id": "faq-read-understand-06-ich-m-chte-meine-lizenz-k-ndigen",
            "title": "Ich möchte meine Lizenz kündigen",
            "synonyms": [
              "ich möchte meine lizenz kündigen"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Ich möchte meine Lizenz kündigen helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          },
          {
            "id": "faq-read-understand-07-ich-m-chte-meinen-account-k-ndigen",
            "title": "Ich möchte meinen Account kündigen",
            "synonyms": [
              "ich möchte meinen account kündigen"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Ich möchte meinen Account kündigen helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          },
          {
            "id": "faq-read-understand-08-ich-m-chte-f-r-mitarbeiter-eine-lizenz-kaufen",
            "title": "Ich möchte für Mitarbeiter eine Lizenz kaufen",
            "synonyms": [
              "ich möchte für mitarbeiter eine lizenz kaufen"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Ich möchte für Mitarbeiter eine Lizenz kaufen helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          },
          {
            "id": "faq-read-understand-09-system-betrieb",
            "title": "System & Betrieb:",
            "synonyms": [
              "system & betrieb:"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "System & Betrieb: helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          },
          {
            "id": "faq-read-understand-10-was-sind-die-systemanforderungen",
            "title": "Was sind die Systemanforderungen?",
            "synonyms": [
              "was sind die systemanforderungen?"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Was sind die Systemanforderungen? helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          },
          {
            "id": "faq-read-understand-11-auf-welchen-betriebssystemen-l-uft-kosma",
            "title": "Auf welchen Betriebssystemen läuft KOSMA?",
            "synonyms": [
              "auf welchen betriebssystemen läuft kosma?"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Auf welchen Betriebssystemen läuft KOSMA? helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          },
          {
            "id": "faq-read-understand-12-funktioniert-kosma-ohne-internet",
            "title": "Funktioniert KOSMA ohne Internet?",
            "synonyms": [
              "funktioniert kosma ohne internet?"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Funktioniert KOSMA ohne Internet? helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          },
          {
            "id": "faq-read-understand-13-gibt-es-schulungskurse-f-r-kosma",
            "title": "Gibt es Schulungskurse für KOSMA?",
            "synonyms": [
              "gibt es schulungskurse für kosma?"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Gibt es Schulungskurse für KOSMA? helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          },
          {
            "id": "faq-read-understand-14-daten-sicherheit",
            "title": "Daten & Sicherheit:",
            "synonyms": [
              "daten & sicherheit:"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Daten & Sicherheit: helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          },
          {
            "id": "faq-read-understand-15-wie-und-wo-werden-die-daten-gespeichert",
            "title": "Wie und wo werden die Daten gespeichert?",
            "synonyms": [
              "wie und wo werden die daten gespeichert?"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Wie und wo werden die Daten gespeichert? helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          },
          {
            "id": "faq-read-understand-16-was-passiert-mit-meinen-daten-wenn-meine-lizenz-abgelaufen-ist",
            "title": "Was passiert mit meinen Daten wenn meine Lizenz abgelaufen ist?",
            "synonyms": [
              "was passiert mit meinen daten wenn meine lizenz abgelaufen ist?"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Was passiert mit meinen Daten wenn meine Lizenz abgelaufen ist? helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          },
          {
            "id": "faq-read-understand-17-ich-m-chte-ein-projektlangfristig-sichern-und-archivieren",
            "title": "Ich möchte ein Projektlangfristig sichern und archivieren",
            "synonyms": [
              "ich möchte ein projektlangfristig sichern und archivieren"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Ich möchte ein Projektlangfristig sichern und archivieren helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          },
          {
            "id": "faq-read-understand-18-lizenz-abrechnung",
            "title": "Lizenz & Abrechnung:",
            "synonyms": [
              "lizenz & abrechnung:"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Lizenz & Abrechnung: helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          },
          {
            "id": "faq-read-understand-19-was-kostet-eine-lizenz",
            "title": "Was kostet eine Lizenz?",
            "synonyms": [
              "was kostet eine lizenz?"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Was kostet eine Lizenz? helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          },
          {
            "id": "faq-read-understand-20-braucht-jeder-nutzer-eine-lizenz",
            "title": "Braucht jeder Nutzer eine Lizenz?",
            "synonyms": [
              "braucht jeder nutzer eine lizenz?"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Braucht jeder Nutzer eine Lizenz? helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          },
          {
            "id": "faq-read-understand-21-auf-wievielen-ger-ten-funktioniert-eine-lizenz",
            "title": "Auf wievielen Geräten funktioniert eine Lizenz?",
            "synonyms": [
              "auf wievielen geräten funktioniert eine lizenz?"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Auf wievielen Geräten funktioniert eine Lizenz? helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          },
          {
            "id": "faq-read-understand-22-wie-bekomme-ich-eine-rechnung",
            "title": "Wie bekomme ich eine Rechnung?",
            "synonyms": [
              "wie bekomme ich eine rechnung?"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Wie bekomme ich eine Rechnung? helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          },
          {
            "id": "faq-read-understand-23-hilfe-support",
            "title": "Hilfe & Support:",
            "synonyms": [
              "hilfe & support:"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Hilfe & Support: helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          },
          {
            "id": "faq-read-understand-24-ich-m-chte-die-hilfe-verwenden",
            "title": "Ich möchte die Hilfe verwenden",
            "synonyms": [
              "ich möchte die hilfe verwenden"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Ich möchte die Hilfe verwenden helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          },
          {
            "id": "faq-read-understand-25-wird-kosma-von-f-rderanstalten-anerkannt",
            "title": "Wird KOSMA von Förderanstalten anerkannt?",
            "synonyms": [
              "wird kosma von förderanstalten anerkannt?"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Wird KOSMA von Förderanstalten anerkannt? helps you interpret the current state of your data on this screen.",
              "sections": []
            }
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "faq-read-understand-01-faq-list-answers",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "faq-read-understand-02-faq-categories",
              "label": 2,
              "x": 38,
              "y": 37
            },
            {
              "articleId": "faq-read-understand-03-example-topics-keyboard-shortcuts-formulas-copy-paste-system-requirements-apple-m1-setup",
              "label": 3,
              "x": 61,
              "y": 54
            },
            {
              "articleId": "faq-read-understand-04-lizenz-account",
              "label": 4,
              "x": 84,
              "y": 71
            },
            {
              "articleId": "faq-read-understand-05-ich-m-chte-meine-lizenz-upraden-downgraden",
              "label": 5,
              "x": 37,
              "y": 28
            },
            {
              "articleId": "faq-read-understand-06-ich-m-chte-meine-lizenz-k-ndigen",
              "label": 6,
              "x": 60,
              "y": 45
            },
            {
              "articleId": "faq-read-understand-07-ich-m-chte-meinen-account-k-ndigen",
              "label": 7,
              "x": 83,
              "y": 62
            },
            {
              "articleId": "faq-read-understand-08-ich-m-chte-f-r-mitarbeiter-eine-lizenz-kaufen",
              "label": 8,
              "x": 36,
              "y": 79
            },
            {
              "articleId": "faq-read-understand-09-system-betrieb",
              "label": 9,
              "x": 59,
              "y": 36
            },
            {
              "articleId": "faq-read-understand-10-was-sind-die-systemanforderungen",
              "label": 10,
              "x": 82,
              "y": 53
            },
            {
              "articleId": "faq-read-understand-11-auf-welchen-betriebssystemen-l-uft-kosma",
              "label": 11,
              "x": 35,
              "y": 70
            },
            {
              "articleId": "faq-read-understand-12-funktioniert-kosma-ohne-internet",
              "label": 12,
              "x": 58,
              "y": 27
            },
            {
              "articleId": "faq-read-understand-13-gibt-es-schulungskurse-f-r-kosma",
              "label": 13,
              "x": 81,
              "y": 44
            },
            {
              "articleId": "faq-read-understand-14-daten-sicherheit",
              "label": 14,
              "x": 34,
              "y": 61
            },
            {
              "articleId": "faq-read-understand-15-wie-und-wo-werden-die-daten-gespeichert",
              "label": 15,
              "x": 57,
              "y": 78
            },
            {
              "articleId": "faq-read-understand-16-was-passiert-mit-meinen-daten-wenn-meine-lizenz-abgelaufen-ist",
              "label": 16,
              "x": 80,
              "y": 35
            },
            {
              "articleId": "faq-read-understand-17-ich-m-chte-ein-projektlangfristig-sichern-und-archivieren",
              "label": 17,
              "x": 33,
              "y": 52
            },
            {
              "articleId": "faq-read-understand-18-lizenz-abrechnung",
              "label": 18,
              "x": 56,
              "y": 69
            },
            {
              "articleId": "faq-read-understand-19-was-kostet-eine-lizenz",
              "label": 19,
              "x": 79,
              "y": 26
            },
            {
              "articleId": "faq-read-understand-20-braucht-jeder-nutzer-eine-lizenz",
              "label": 20,
              "x": 32,
              "y": 43
            },
            {
              "articleId": "faq-read-understand-21-auf-wievielen-ger-ten-funktioniert-eine-lizenz",
              "label": 21,
              "x": 55,
              "y": 60
            },
            {
              "articleId": "faq-read-understand-22-wie-bekomme-ich-eine-rechnung",
              "label": 22,
              "x": 78,
              "y": 77
            },
            {
              "articleId": "faq-read-understand-23-hilfe-support",
              "label": 23,
              "x": 31,
              "y": 34
            },
            {
              "articleId": "faq-read-understand-24-ich-m-chte-die-hilfe-verwenden",
              "label": 24,
              "x": 54,
              "y": 51
            },
            {
              "articleId": "faq-read-understand-25-wird-kosma-von-f-rderanstalten-anerkannt",
              "label": 25,
              "x": 77,
              "y": 68
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
            "id": "faq-change-control-01-search-filter-questions",
            "title": "Search / filter questions",
            "synonyms": [
              "search / filter questions"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Search / filter questions to adjust how data is displayed or calculated on this screen.",
              "sections": [
                {
                  "heading": "What it controls",
                  "body": "Search / filter questions changes how information is displayed or calculated in this module."
                },
                {
                  "heading": "Example",
                  "body": "Toggle the setting and compare the output before and after to confirm the effect.",
                  "type": "technical"
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
            "id": "faq-change-control-02-configure",
            "title": "Configure",
            "synonyms": [
              "configure"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Use Configure to adjust how data is displayed or calculated on this screen.",
              "sections": [
                {
                  "heading": "What it controls",
                  "body": "Configure changes how information is displayed or calculated in this module."
                },
                {
                  "heading": "Example",
                  "body": "Toggle the setting and compare the output before and after to confirm the effect.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "faq-change-control-01-search-filter-questions",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "faq-change-control-02-configure",
              "label": 2,
              "x": 38,
              "y": 37
            }
          ]
        }
      },
      {
        "id": "create-manage",
        "title": "Create / Manage",
        "iconKey": "PlusCircle",
        "articles": [],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": []
        }
      },
      {
        "id": "navigate-views",
        "title": "Navigate / Views",
        "iconKey": "Layout",
        "articles": [
          {
            "id": "faq-navigate-views-01-link-to-kb-learning-articles",
            "title": "Link to KB / Learning articles",
            "synonyms": [
              "link to kb / learning articles"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Link to KB / Learning articles helps you switch views or move to related modules.",
              "sections": [
                {
                  "heading": "Where it takes you",
                  "body": "Link to KB / Learning articles takes you to a different view or module without losing context."
                },
                {
                  "heading": "Example",
                  "body": "Use it to switch from Budgeting to Financing and compare the same project data.",
                  "type": "technical"
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
            "id": "faq-navigate-views-02-support-feature-request",
            "title": "Support / Feature request",
            "synonyms": [
              "support / feature request"
            ],
            "relatedLearningIds": [],
            "content": {
              "definition": "Support / Feature request helps you switch views or move to related modules.",
              "sections": [
                {
                  "heading": "Where it takes you",
                  "body": "Support / Feature request takes you to a different view or module without losing context."
                },
                {
                  "heading": "Example",
                  "body": "Use it to switch from Budgeting to Financing and compare the same project data.",
                  "type": "technical"
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
          }
        ],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": [
            {
              "articleId": "faq-navigate-views-01-link-to-kb-learning-articles",
              "label": 1,
              "x": 15,
              "y": 20
            },
            {
              "articleId": "faq-navigate-views-02-support-feature-request",
              "label": 2,
              "x": 38,
              "y": 37
            }
          ]
        }
      },
      {
        "id": "share-sync",
        "title": "Share / Sync",
        "iconKey": "RefreshCw",
        "articles": [],
        "visualMap": {
          "imageSrc": PROTOTYPE_IMG_URL,
          "markers": []
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
