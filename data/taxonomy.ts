
import { 
  Rocket, Calculator, PieChart, TrendingUp, Settings, Printer, Share2, 
  CircleHelp, BookOpen, GraduationCap, ShieldCheck, Film,
  Eye, Sliders, PlusCircle, Layout, RefreshCw, Compass, FolderCog, Edit3, Coins
} from 'lucide-react';

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
  // Module Icons
  'Rocket': Rocket,
  'Calculator': Calculator,
  'PieChart': PieChart,
  'TrendingUp': TrendingUp,
  'Settings': Settings,
  'Printer': Printer,
  'Share2': Share2,
  'BookOpen': BookOpen,
  'GraduationCap': GraduationCap,
  'ShieldCheck': ShieldCheck,
  'Film': Film,
  'CircleHelp': CircleHelp,
  'Coins': Coins,

  // KB Section Icons (Standardized)
  'Eye': Eye,             // Read / Understand
  'Sliders': Sliders,     // Change / Control
  'PlusCircle': PlusCircle, // Create / Manage
  'Layout': Layout,       // Navigate / Views
  'RefreshCw': RefreshCw, // Share / Sync
  'FolderCog': FolderCog,
  'Edit3': Edit3,
  'Compass': Compass
};

export const ROLE_LABELS: Record<UserRoleFilter | 'Alle', string> = {
  'Alle': 'All',
  'Produktion': 'Production Manager',
  'Herstellungsleitung': 'Line Producer',
  'Finanzbuchhaltung': 'Accounting'
};
