
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
  id?: string; // Optional made for smoother import
  summary?: string;
  steps: HelpStep[];
}

export interface HelpArticle {
  id: string;
  title: string;
  roles?: string[]; // Relaxed type to allow string match from JSON
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
        entry: { summary: "", steps: [] }
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
        entry: { summary: "", steps: [] }
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
        entry: { summary: "", steps: [] }
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
        entry: { summary: "", steps: [] }
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
        entry: { summary: "", steps: [] }
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
        entry: { summary: "", steps: [] }
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
