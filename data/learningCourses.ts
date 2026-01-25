
import { HelpArticle } from './helpArticles';

export interface LearningGoal {
  id: string;           // e.g., "A1"
  title: string;        // English label for UI, defaults to article title if not set
  durationMin: number;  // numeric duration per goal
  articleId: string;    // maps to HelpArticle.id in helpArticles.ts
}

export interface LearningPath {
  id: string;
  title: string;        // e.g., "Course path"
  goalIds: string[];    // ordered list of goal ids
}

export interface LearningCourse {
  id: string;
  title: string;        // course title (English)
  teaser: string;       // 1–2 sentences in English
  languages: string[];  // ["German", "English"]
  goals: LearningGoal[];
  // path is derived from goals in this implementation, but keeping interface consistent
}

export const COURSES: LearningCourse[] = [
  {
    id: "intro-budgeting",
    title: "Introduction to Budgeting",
    teaser: "Learn the fundamentals of KOSMA. From installation to your first budget lines.",
    languages: ["German", "English"],
    goals: [
      { id: "1", title: "Register and install", durationMin: 5, articleId: "A1" },
      { id: "2", title: "Add or delete a project", durationMin: 3, articleId: "F1" },
      { id: "3", title: "Archive my project", durationMin: 2, articleId: "F2" },
      { id: "4", title: "Manage project members", durationMin: 3, articleId: "F3" },
      { id: "5", title: "Laden und anpassen einer Budgetvorlage", durationMin: 5, articleId: "A2" },
      { id: "6", title: "Edit budget accounts", durationMin: 10, articleId: "A3" },
      { id: "7", title: "Budget personnel", durationMin: 8, articleId: "A4" },
      { id: "8", title: "Edit markups", durationMin: 5, articleId: "A5" },
      { id: "9", title: "Structure with subaccounts", durationMin: 5, articleId: "B10" },
      { id: "10", title: "Number accounts", durationMin: 3, articleId: "B18" }
    ]
  },
  {
    id: "intro-cashflow",
    title: "Introduction to Cashflow",
    teaser: "Understand the basics of liquidity planning. Connect your budget to the timeline.",
    languages: ["German", "English"],
    goals: [
      { id: "1", title: "Adjust the timeline", durationMin: 5, articleId: "A7" },
      { id: "2", title: "Project timeline adjustments", durationMin: 5, articleId: "B16" },
      { id: "3", title: "Milestones & phases", durationMin: 8, articleId: "D1" },
      { id: "4", title: "Cash flow rules", durationMin: 10, articleId: "D2" },
      { id: "5", title: "Create cash flow plan", durationMin: 5, articleId: "D3" }
    ]
  },
  {
    id: "intro-cost-control",
    title: "Introduction to Cost Control",
    teaser: "Keep track of your spending. Compare plan vs. actuals effectively.",
    languages: ["German", "English"],
    goals: [
      { id: "1", title: "Reconcile budget vs. actuals", durationMin: 10, articleId: "E1" },
      { id: "2", title: "Filter and display costs", durationMin: 5, articleId: "E6" },
      { id: "3", title: "View and print reports", durationMin: 5, articleId: "E7" }
    ]
  },
  {
    id: "adv-budgeting",
    title: "Advanced Budgeting",
    teaser: "Deep dive into complex calculations, fringes, variables, and exports.",
    languages: ["German", "English"],
    goals: [
      { id: "1", title: "Split costs (Producers)", durationMin: 8, articleId: "B1" },
      { id: "2", title: "Define fringes & supplements", durationMin: 10, articleId: "B2" },
      { id: "3", title: "Apply fringes", durationMin: 5, articleId: "B3" },
      { id: "4", title: "Define additional costs", durationMin: 5, articleId: "B4" },
      { id: "5", title: "Calculate additional costs", durationMin: 5, articleId: "B5" },
      { id: "6", title: "Spending/Funding effects", durationMin: 8, articleId: "B6" },
      { id: "7", title: "Include VAT", durationMin: 3, articleId: "B7" },
      { id: "8", title: "Variables & formulas", durationMin: 12, articleId: "B8" },
      { id: "9", title: "Print budget", durationMin: 5, articleId: "A6" },
      { id: "10", title: "Export to Excel", durationMin: 3, articleId: "B19" },
      { id: "11", title: "Share budget data", durationMin: 5, articleId: "G1" }
    ]
  },
  {
    id: "adv-cashflow",
    title: "Advanced Cashflow",
    teaser: "Master financing plans, installments, and complex cash flow scenarios.",
    languages: ["German", "English"],
    goals: [
      { id: "1", title: "Adjust cash flow view", durationMin: 5, articleId: "D4" },
      { id: "2", title: "Loans & transfers", durationMin: 5, articleId: "D5" },
      { id: "3", title: "Export cash flow", durationMin: 3, articleId: "D6" },
      { id: "4", title: "Load financing template", durationMin: 5, articleId: "C1" },
      { id: "5", title: "Manage financing sources", durationMin: 8, articleId: "C2" },
      { id: "6", title: "Funding effects as variables", durationMin: 8, articleId: "C3" },
      { id: "7", title: "Link spending to sources", durationMin: 8, articleId: "C4" },
      { id: "8", title: "Track installments", durationMin: 5, articleId: "C7" },
      { id: "9", title: "Link financing to budget", durationMin: 5, articleId: "C8" }
    ]
  },
  {
    id: "adv-cost-control",
    title: "Advanced Cost Control",
    teaser: "Handle accounting imports, forecast recalculations, and final settlements.",
    languages: ["German", "English"],
    goals: [
      { id: "1", title: "Track effects", durationMin: 5, articleId: "E2" },
      { id: "2", title: "Import accounting data", durationMin: 10, articleId: "E3" },
      { id: "3", title: "Create final settlement", durationMin: 10, articleId: "E11" },
      { id: "4", title: "Print cost control", durationMin: 5, articleId: "G5" }
    ]
  }
];
