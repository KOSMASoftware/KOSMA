
import { Rocket, Calculator, PieChart, TrendingUp, Settings, Printer, Share2, CircleHelp, BookOpen, GraduationCap, ShieldCheck, Film } from 'lucide-react';

// --- SHARED TYPES ---

export type UserRoleFilter = 'Produktion' | 'Herstellungsleitung' | 'Finanzbuchhaltung';

export interface HelpMedia {
  kind: 'image' | 'video';
  bucket: string;
  path: string;
  alt?: string;
  w?: number;
  h?: number;
  posterPath?: string;
}

// --- ICON MAPPING ---
export const DOC_ICONS: Record<string, any> = {
  'Rocket': Rocket,
  'Calculator': Calculator,
  'PieChart': PieChart,
  'TrendingUp': TrendingUp,
  'Settings': Settings,
  'CircleHelp': CircleHelp,
  'Printer': Printer,
  'Share2': Share2,
  'BookOpen': BookOpen,
  'GraduationCap': GraduationCap,
  'ShieldCheck': ShieldCheck,
  'Film': Film
};

export const ROLE_LABELS: Record<UserRoleFilter | 'Alle', string> = {
  'Alle': 'All',
  'Produktion': 'Production',
  'Herstellungsleitung': 'Line Producer',
  'Finanzbuchhaltung': 'Accounting'
};
