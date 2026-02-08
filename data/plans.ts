import { PlanTier } from '../types';
import { Calculator, BarChart3, Clapperboard, Users } from 'lucide-react';

export interface PlanDefinition {
  name: PlanTier;
  title: string;
  subtitle?: string;
  Icon: any;
  priceMonthly: number; // 0 for free
  priceYearly: number;  // 0 for free
  saveYearly: number | null; // Amount saved per year
  color: string;
  textClass: string;
  features: string[];
  btnClass?: string; // Optional styling for marketing buttons
}

export const PLANS: PlanDefinition[] = [
  {
    name: PlanTier.FREE,
    title: "Free",
    subtitle: "For everyone who wants to try it out",
    Icon: Users,
    priceMonthly: 0,
    priceYearly: 0,
    saveYearly: null,
    color: "#1F2937", // Gray-800
    textClass: "text-gray-800",
    btnClass: "border-gray-800 text-gray-900 hover:bg-gray-50",
    features: [
      "14-day full feature trial",
      "View project data in all modules",
      "No printing",
      "No sharing"
    ]
  },
  {
    name: PlanTier.BUDGET,
    title: "Budget",
    subtitle: "For production managers focused on budget creation.",
    Icon: Calculator,
    priceMonthly: 39,
    priceYearly: 390,
    saveYearly: 78,
    color: "#F59E0B", // Amber-500
    textClass: "text-amber-500",
    btnClass: "border-amber-500 text-amber-600 bg-amber-50 hover:bg-amber-100",
    features: [
      "Budgeting Module",
      "Unlimited Projects",
      "Print to PDF"
    ]
  },
  {
    name: PlanTier.COST_CONTROL,
    title: "Cost Control",
    subtitle: "For production managers monitoring production costs.",
    Icon: BarChart3,
    priceMonthly: 69,
    priceYearly: 590,
    saveYearly: 238,
    color: "#9333EA", // Purple-600
    textClass: "text-purple-600",
    btnClass: "border-purple-600 text-purple-700 bg-purple-50 hover:bg-purple-100",
    features: [
      "Budgeting + Cost Control",
      "Soll/Ist Comparison",
      "Share projects"
    ]
  },
  {
    name: PlanTier.PRODUCTION,
    title: "Production",
    subtitle: "For producers seeking full project control.",
    Icon: Clapperboard,
    priceMonthly: 89,
    priceYearly: 690,
    saveYearly: 378,
    color: "#16A34A", // Green-600
    textClass: "text-green-600",
    btnClass: "border-green-600 text-green-700 bg-green-50 hover:bg-green-100",
    features: [
      "All Modules",
      "Financing & Cashflow",
      "Multi-Project Overview"
    ]
  }
];

export const PLAN_RANK: Record<string, number> = {
  [PlanTier.FREE]: 0,
  [PlanTier.BUDGET]: 1,
  [PlanTier.COST_CONTROL]: 2,
  [PlanTier.PRODUCTION]: 3
};

export const getPlanPrice = (planName: PlanTier, cycle: 'monthly' | 'yearly'): number => {
  const plan = PLANS.find(p => p.name === planName);
  if (!plan) return 0;
  return cycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
};
