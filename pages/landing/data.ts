import { PencilRuler, Coins, Video, Scissors, Flag, Calculator, PieChart, BarChart3 } from 'lucide-react';

export const BRAND = '#0093D5';
export const BG = '#0b0f14';

export type ModuleTheme = {
  activeTab: string;
  dotActive: string;
  ring: string;
  label: string;
  pill: string;
  mobileNumber: string;
};

export type FeatureItem = {
  title: string;
  desc: string;
  pain: string;
  solution: string;
  impact: string;
  image: string;
};

export type ModuleData = {
  id: string;
  label: string;
  icon: any;
  colorName: 'amber' | 'purple' | 'brand' | 'rose' | 'green';
  theme: ModuleTheme;
  features: FeatureItem[];
};

export const MODULES: ModuleData[] = [
  {
    id: 'development',
    label: 'Development',
    icon: PencilRuler,
    colorName: 'amber',
    theme: {
      activeTab: 'text-amber-600 bg-amber-50 shadow-amber-500/10 ring-1 ring-amber-100',
      dotActive: 'bg-amber-500 border-amber-100',
      ring: 'ring-amber-500',
      label: 'text-amber-600',
      pill: 'bg-amber-50 border-amber-200 text-amber-700',
      mobileNumber: 'bg-amber-50 text-amber-600 border-amber-100'
    },
    features: [
      {
        title: 'Financing plan templates',
        desc: 'Faster setup with consistent financing structure.',
        pain: 'Each financing plan starts from scratch.',
        solution: 'Load a financing plan template and adapt it quickly.',
        impact: 'Faster setup with consistent financing structure.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Define fringes & supplements',
        desc: 'Consistent, compliant cost calculations across all accounts.',
        pain: 'Fringes and wage supplements are calculated differently across projects.',
        solution: 'Define standard fringes and wage supplements once in settings.',
        impact: 'Consistent, compliant cost calculations across all accounts.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Define extra costs',
        desc: 'Full visibility of true personnel costs in one place.',
        pain: 'Extra personnel costs are tracked outside the budget.',
        solution: 'Define extra cost types (travel, catering, hotels) in KOSMA.',
        impact: 'Full visibility of true personnel costs in one place.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      }
    ]
  },
  {
    id: 'financing',
    label: 'Financing',
    icon: Coins,
    colorName: 'purple',
    theme: {
      activeTab: 'text-purple-600 bg-purple-50 shadow-purple-500/10 ring-1 ring-purple-100',
      dotActive: 'bg-purple-600 border-purple-100',
      ring: 'ring-purple-600',
      label: 'text-purple-600',
      pill: 'bg-purple-50 border-purple-200 text-purple-700',
      mobileNumber: 'bg-purple-50 text-purple-600 border-purple-100'
    },
    features: [
      {
        title: 'Manage financing sources',
        desc: 'Clear funding ownership and easier partner reporting.',
        pain: 'Financing sources and producer shares are scattered across files.',
        solution: 'Edit financing sources and assign them to producers directly.',
        impact: 'Clear funding ownership and easier partner reporting.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Split costs between producers',
        desc: 'Clear cost ownership and faster co‑production reporting.',
        pain: 'Costs are split manually across partners, making co‑production budgets messy.',
        solution: 'KOSMA lets you assign costs to multiple producers directly in settings.',
        impact: 'Clear cost ownership and faster co‑production reporting.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Funding effects as variables',
        desc: 'Accurate funding calculations tied to real budget data.',
        pain: 'Funding logic is hard to integrate with budget effects.',
        solution: 'Use funding effects as variables in the financing plan.',
        impact: 'Accurate funding calculations tied to real budget data.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      }
    ]
  },
  {
    id: 'production',
    label: 'Production',
    icon: Video,
    colorName: 'brand',
    theme: {
      activeTab: 'text-brand-600 bg-brand-50 shadow-brand-500/10 ring-1 ring-brand-100',
      dotActive: 'bg-brand-600 border-brand-100',
      ring: 'ring-brand-600',
      label: 'text-brand-600',
      pill: 'bg-brand-50 border-brand-200 text-brand-700',
      mobileNumber: 'bg-brand-50 text-brand-600 border-brand-100'
    },
    features: [
      {
        title: 'Define milestones & phases',
        desc: 'Cash‑flow stays aligned with production timelines.',
        pain: 'Cash‑flow rules have to be updated manually whenever schedules change.',
        solution: 'Define milestones and phases to automate cash‑flow logic.',
        impact: 'Cash‑flow stays aligned with production timelines.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Create cash‑flow rules',
        desc: 'Consistent payment schedules with less manual work.',
        pain: 'Payment timing is handled in separate spreadsheets.',
        solution: 'Create cash‑flow rules directly inside KOSMA.',
        impact: 'Consistent payment schedules with less manual work.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Build a cash‑flow plan',
        desc: 'Immediate financial visibility for production planning.',
        pain: 'Budget and financing data don’t automatically translate into cash‑flow.',
        solution: 'Generate a cash‑flow plan from budget + financing.',
        impact: 'Immediate financial visibility for production planning.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      }
    ]
  },
  {
    id: 'post-production',
    label: 'Post Production',
    icon: Scissors,
    colorName: 'rose',
    theme: {
      activeTab: 'text-rose-600 bg-rose-50 shadow-rose-500/10 ring-1 ring-rose-100',
      dotActive: 'bg-rose-600 border-rose-100',
      ring: 'ring-rose-600',
      label: 'text-rose-600',
      pill: 'bg-rose-50 border-rose-200 text-rose-700',
      mobileNumber: 'bg-rose-50 text-rose-600 border-rose-100'
    },
    features: [
      {
        title: 'Compare plan vs actuals',
        desc: 'Immediate visibility of overruns and deviations.',
        pain: 'Actual costs live outside the budget and are hard to reconcile.',
        solution: 'Match actual costs against the budget in Cost Control.',
        impact: 'Immediate visibility of overruns and deviations.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Recalculate forecasts',
        desc: 'Up‑to‑date cost outlooks at any time.',
        pain: 'Forecasts are outdated as soon as costs change.',
        solution: 'Recalculate forecasts per account instantly.',
        impact: 'Up‑to‑date cost outlooks at any time.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Link expenses to sources',
        desc: 'Transparent funding allocation and stronger auditability.',
        pain: 'It’s unclear which funding source covers which expense effect.',
        solution: 'Connect expense effects to specific financing sources.',
        impact: 'Transparent funding allocation and stronger auditability.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      }
    ]
  },
  {
    id: 'final-accounts',
    label: 'Final Accounts',
    icon: Flag,
    colorName: 'green',
    theme: {
      activeTab: 'text-green-600 bg-green-50 shadow-green-500/10 ring-1 ring-green-100',
      dotActive: 'bg-green-600 border-green-100',
      ring: 'ring-green-600',
      label: 'text-green-600',
      pill: 'bg-green-50 border-green-200 text-green-700',
      mobileNumber: 'bg-green-50 text-green-600 border-green-100'
    },
    features: [
      {
        title: 'Import accounting data',
        desc: 'Less manual work and fewer reconciliation errors.',
        pain: 'Accounting data must be re‑entered manually.',
        solution: 'Import accounting data directly into Cost Control.',
        impact: 'Less manual work and fewer reconciliation errors.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Add loans/transfers',
        desc: 'Complete cash‑flow picture without external tools.',
        pain: 'Inter‑producer transfers and loans are tracked separately.',
        solution: 'Add loans or transfers directly into the cash‑flow plan.',
        impact: 'Complete cash‑flow picture without external tools.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Generate cost reports',
        desc: 'Fast reporting for producers and financiers.',
        pain: 'Reporting requires extra spreadsheets and formatting.',
        solution: 'Show and print cost reports from Cost Control.',
        impact: 'Fast reporting for producers and financiers.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      }
    ]
  }
];