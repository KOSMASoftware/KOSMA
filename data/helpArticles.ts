import { UserRoleFilter } from './taxonomy';

export interface HelpMedia {
  kind: 'image' | 'video';
  bucket: string;
  path: string;
  alt?: string;
  w?: number;
  h?: number;
  posterPath?: string;
}

export interface HelpStep {
  id: string;
  title: string;
  content: string;
  media?: HelpMedia;
  warning?: string;
  tip?: string;
  hint?: string;
}

export interface HelpEntry {
  id?: string;
  summary?: string;
  steps: HelpStep[];
}

export interface HelpArticle {
  id: string;
  title: string;
  roles?: string[]; 
  tags?: string[];
  entry: HelpEntry;
}

export interface HelpCategory {
  id: string;
  title: string;
  iconKey: string; 
  description?: string;
  articles: HelpArticle[];
}

export const HELP_DATA: HelpCategory[] = [
  {
    id: "project-basics",
    title: "Project Start & Fundamentals",
    iconKey: "Rocket",
    description: "Konto einrichten, Software installieren und erste Schritte.",
    articles: [
      {
        id: "A1",
        title: "Register and install the software",
        roles: ["Produktion", "Herstellungsleitung", "Finanzbuchhaltung"],
        entry: {
          summary: "Install KOSMA, sign in, and get your first project ready.",
          steps: [
            {
              id: "s1",
              title: "Open KOSMA and sign in",
              content: "Launch the app and log in. If you need an account, visit kosma.io and register first.",
              tip: "Use the same email you will use for project invitations.",
              media: {
                kind: "image",
                bucket: "help-assets",
                path: "demo/kosma-vergleich.png",
                alt: "KOSMA Vergleich"
              }
            },
            {
              id: "s2",
              title: "Review the Project Manager",
              content: "You will land in the Project Manager. Here you can create, open, delete, or archive projects, and see your permission level.",
              media: {
                kind: "image",
                bucket: "help-assets",
                path: "demo/kosma-vergleich.png",
                alt: "KOSMA Vergleich"
              }
            },
            {
              id: "s3",
              title: "Open a project in Budgeting",
              content: "Projects open in the Budgeting module by default. Use the top navigation to switch modules if your license allows it.",
              media: {
                kind: "image",
                bucket: "help-assets",
                path: "demo/kosma-vergleich.png",
                alt: "KOSMA Vergleich"
              }
            },
            {
              id: "s4",
              title: "Know the main areas",
              content: "KOSMA is split into Navigation Area, Edit Area, and Macro Area. These are the core areas where you browse, edit, and add details.",
              media: {
                kind: "image",
                bucket: "help-assets",
                path: "demo/kosma-vergleich.png",
                alt: "KOSMA Vergleich"
              }
            }
          ]
        }
      },
      {
        id: "A2",
        title: "Load and adapt a budget template",
        roles: ["Produktion", "Herstellungsleitung", "Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "B12",
        title: "Import data from Excel or other sources into my budget",
        roles: ["Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "B17",
        title: "Change currencies and exchange rates",
        roles: ["Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "F1",
        title: "Add or delete a project",
        roles: ["Produktion", "Herstellungsleitung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "F2",
        title: "Archive my project",
        roles: ["Produktion", "Herstellungsleitung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "F3",
        title: "Add or remove project members",
        roles: ["Produktion", "Herstellungsleitung"],
        entry: { summary: "", steps: [] }
      }
    ]
  },
  {
    id: "budgeting",
    title: "Create Budget",
    iconKey: "Calculator",
    description: "Budgets aufsetzen, Währungen wählen und Positionen erfassen.",
    articles: [
      {
        id: "A3",
        title: "Edit a budget account",
        roles: ["Produktion", "Herstellungsleitung"],
        entry: {
          summary: "Create a new budget and start entering your first accounts.",
          steps: [
            {
              id: "s1",
              title: "Create a new project or load a template",
              content: "Click “Create Project” and choose whether to start with an empty budget or load a template.",
              media: {
                kind: "image",
                bucket: "help-assets",
                path: "demo/kosma-vergleich.png",
                alt: "KOSMA Vergleich"
              }
            },
            {
              id: "s2",
              title: "Set project details",
              content: "Enter the project information and confirm the base settings before you begin budgeting.",
              media: {
                kind: "image",
                bucket: "help-assets",
                path: "demo/kosma-vergleich.png",
                alt: "KOSMA Vergleich"
              }
            },
            {
              id: "s3",
              title: "Add your first category",
              content: "Your first budget appears in the list. Start by adding a category, then add groups and accounts as needed.",
              media: {
                kind: "image",
                bucket: "help-assets",
                path: "demo/kosma-vergleich.png",
                alt: "KOSMA Vergleich"
              }
            }
          ]
        }
      },
      {
        id: "A4",
        title: "Budget personnel and wage earners",
        roles: ["Produktion"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "A5",
        title: "Edit markups",
        roles: ["Produktion", "Herstellungsleitung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "B1",
        title: "Split costs between multiple producers",
        roles: ["Produktion"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "B2",
        title: "Define fringe benefits and wage supplements",
        roles: ["Produktion", "Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "B3",
        title: "Apply/assign fringe benefits and wage supplements",
        roles: ["Produktion", "Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "B4",
        title: "Define additional costs (e.g., meals, travel, hotels)",
        roles: ["Produktion", "Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "B5",
        title: "Calculate additional costs (e.g., meals, travel, hotels)",
        roles: ["Produktion", "Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "B6",
        title: "Define, apply, and view spending/funding effects",
        roles: ["Produktion", "Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "B7",
        title: "Include VAT",
        roles: ["Produktion", "Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "B8",
        title: "Automate budgets with formulas and variables (globals)",
        roles: ["Produktion", "Herstellungsleitung", "Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "B10",
        title: "Structure accounts with subaccounts",
        roles: ["Produktion"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "B18",
        title: "Number accounts",
        roles: ["Produktion", "Herstellungsleitung"],
        entry: { summary: "", steps: [] }
      }
    ]
  },
  {
    id: "financing",
    title: "Create Financing Plan",
    iconKey: "PieChart",
    description: "Finanzierungsquellen definieren und zuweisen.",
    articles: [
      {
        id: "C1",
        title: "Load and adapt a financing plan template",
        roles: ["Produktion", "Herstellungsleitung"],
        entry: {
          summary: "Set up your financing plan and track incoming installments.",
          steps: [
            {
              id: "s1",
              title: "Create a financing plan",
              content: "Open the Financing module and create a new financing plan for your project.",
              media: {
                kind: "image",
                bucket: "help-assets",
                path: "demo/kosma-vergleich.png",
                alt: "KOSMA Vergleich"
              }
            },
            {
              id: "s2",
              title: "Add financing sources",
              content: "Add your funding sources and define the amounts and currency for each line.",
              media: {
                kind: "image",
                bucket: "help-assets",
                path: "demo/kosma-vergleich.png",
                alt: "KOSMA Vergleich"
              }
            },
            {
              id: "s3",
              title: "Track installment status",
              content: "Record incoming installments and update the status so your totals stay accurate.",
              media: {
                kind: "image",
                bucket: "help-assets",
                path: "demo/kosma-vergleich.png",
                alt: "KOSMA Vergleich"
              }
            }
          ]
        }
      },
      {
        id: "C2",
        title: "Edit financing sources and assign producers",
        roles: ["Produktion", "Herstellungsleitung", "Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "C3",
        title: "Use a funding effect as a variable in the financing plan",
        roles: ["Produktion", "Herstellungsleitung", "Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "C4",
        title: "Link a spending effect to a financing source",
        roles: ["Produktion", "Herstellungsleitung", "Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "C5",
        title: "Define and display equity shares, financing ratios, and similar metrics",
        roles: ["Produktion", "Herstellungsleitung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "C7",
        title: "Record financing status and incoming installments/payments",
        roles: ["Produktion", "Herstellungsleitung", "Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "C8",
        title: "Link the financing plan to another budget or cost control",
        roles: ["Produktion", "Herstellungsleitung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "C10",
        title: "Export a financing plan to Excel",
        roles: ["Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      }
    ]
  },
  {
    id: "cash-flow",
    title: "Plan Cash Flow",
    iconKey: "Coins",
    description: "Zahlungsflüsse steuern und Liquidität sichern.",
    articles: [
      {
        id: "A7",
        title: "Adjust and use the timeline",
        roles: ["Produktion", "Herstellungsleitung"],
        entry: {
          summary: "Plan cash flow based on your budget, financing, and schedule.",
          steps: [
            {
              id: "s1",
              title: "Open Cash Flow and set the timeline",
              content: "Switch to the Cash Flow module and choose the time scale that matches your production schedule.",
              media: {
                kind: "image",
                bucket: "help-assets",
                path: "demo/kosma-vergleich.png",
                alt: "KOSMA Vergleich"
              }
            },
            {
              id: "s2",
              title: "Define rules and milestones",
              content: "Add milestones or phases to structure your cash flow and automate allocations over time.",
              media: {
                kind: "image",
                bucket: "help-assets",
                path: "demo/kosma-vergleich.png",
                alt: "KOSMA Vergleich"
              }
            },
            {
              id: "s3",
              title: "Review totals and adjust",
              content: "Check cash flow totals and adjust rules or timing if the plan does not match your needs.",
              media: {
                kind: "image",
                bucket: "help-assets",
                path: "demo/kosma-vergleich.png",
                alt: "KOSMA Vergleich"
              }
            }
          ]
        }
      },
      {
        id: "B16",
        title: "Adjust the project timeline and use the data for budgeting and cash flow",
        roles: ["Produktion"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "D1",
        title: "Define milestones and phases to automate cash flow rules",
        roles: ["Produktion", "Herstellungsleitung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "D2",
        title: "Define and add cash flow rules",
        roles: ["Produktion", "Herstellungsleitung", "Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "D3",
        title: "Create a cash flow plan",
        roles: ["Produktion", "Herstellungsleitung", "Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "D4",
        title: "Adjust the cash flow plan view",
        roles: ["Produktion", "Herstellungsleitung", "Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "D5",
        title: "Add a loan/transfer to the cash flow plan",
        roles: ["Produktion", "Herstellungsleitung", "Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      }
    ]
  },
  {
    id: "cost-control",
    title: "Cost Control",
    iconKey: "TrendingUp",
    description: "Soll/Ist-Vergleiche und Kostenstand-Updates.",
    articles: [
      {
        id: "E1",
        title: "Reconcile my budget with actual costs / control costs",
        roles: ["Produktion", "Finanzbuchhaltung"],
        entry: {
          summary: "Compare actuals vs. plan and keep the cost report accurate.",
          steps: [
            {
              id: "s1",
              title: "Open Cost Control",
              content: "Switch to the Cost Control module to compare budget, expected, and paid values.",
              media: {
                kind: "image",
                bucket: "help-assets",
                path: "demo/kosma-vergleich.png",
                alt: "KOSMA Vergleich"
              }
            },
            {
              id: "s2",
              title: "Add or import actuals",
              content: "Enter actual costs or import data from accounting to keep the report up to date.",
              media: {
                kind: "image",
                bucket: "help-assets",
                path: "demo/kosma-vergleich.png",
                alt: "KOSMA Vergleich"
              }
            },
            {
              id: "s3",
              title: "Analyze deviations",
              content: "Use the deviation and prediction columns to identify variances and update forecasts.",
              media: {
                kind: "image",
                bucket: "help-assets",
                path: "demo/kosma-vergleich.png",
                alt: "KOSMA Vergleich"
              }
            }
          ]
        }
      },
      {
        id: "E2",
        title: "Track spending/funding effects",
        roles: ["Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "E3",
        title: "Import accounting data into cost control",
        roles: ["Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "E5",
        title: "Recalculate the forecast for an account",
        roles: ["Produktion"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "E6",
        title: "Filter and display costs by criteria",
        roles: ["Produktion", "Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "E7",
        title: "View and print cost reports",
        roles: ["Produktion", "Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "E11",
        title: "Create a final settlement",
        roles: ["Produktion", "Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      }
    ]
  },
  {
    id: "reporting",
    title: "Share & Export",
    iconKey: "Printer",
    description: "Berichte exportieren, drucken und Projekte teilen.",
    articles: [
      {
        id: "A6",
        title: "Print budget",
        roles: ["Produktion"],
        entry: {
          summary: "Export, print, and share your project data with others.",
          steps: [
            {
              id: "s1",
              title: "Open Printing & Sharing",
              content: "Go to the Printing & Sharing area to access export and print options.",
              media: {
                kind: "image",
                bucket: "help-assets",
                path: "demo/kosma-vergleich.png",
                alt: "KOSMA Vergleich"
              }
            },
            {
              id: "s2",
              title: "Choose format and export",
              content: "Select PDF or Excel, then export the current dataset.",
              media: {
                kind: "image",
                bucket: "help-assets",
                path: "demo/kosma-vergleich.png",
                alt: "KOSMA Vergleich"
              }
            },
            {
              id: "s3",
              title: "Share with collaborators",
              content: "Share the exported file or sync data so team members can access the latest version.",
              media: {
                kind: "image",
                bucket: "help-assets",
                path: "demo/kosma-vergleich.png",
                alt: "KOSMA Vergleich"
              }
            }
          ]
        }
      },
      {
        id: "B19",
        title: "Export budget to Excel",
        roles: ["Produktion"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "D6",
        title: "Export the cash flow plan to Excel",
        roles: ["Produktion", "Herstellungsleitung", "Finanzbuchhaltung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "G1",
        title: "Share a budget, financing plan, cash flow plan, or cost control with team members",
        roles: ["Produktion", "Herstellungsleitung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "G4",
        title: "Print the financing plan",
        roles: ["Produktion", "Herstellungsleitung"],
        entry: { summary: "", steps: [] }
      },
      {
        id: "G5",
        title: "Print cost control",
        roles: ["Produktion"],
        entry: { summary: "", steps: [] }
      }
    ]
  }
];