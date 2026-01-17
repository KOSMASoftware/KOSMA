
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
  id: string;
  summary?: string;
  steps: HelpStep[];
}

export interface HelpArticle {
  id: string;
  title: string;
  roles?: UserRoleFilter[]; // New Role Filter
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
    id: 'first-steps',
    title: 'First Steps',
    iconKey: 'Rocket',
    description: 'Get started quickly with KOSMA.',
    articles: [
      {
        id: 'registration',
        title: 'Registrierung Website / Konto eröffnen',
        roles: ['Produktion', 'Herstellungsleitung', 'Finanzbuchhaltung'], // Alle relevant
        entry: {
          id: 'entry-registration',
          summary: 'Lade zuerst die Software herunter, führe dann die Registrierung aus und bestätige diese per E-Mail.',
          steps: [
            {
              id: 's1',
              title: 'Zugriff auf die KOSMA Webseite',
              content: 'Öffne www.kosma.io und klicke oben rechts auf den Bereich "Download".',
              tip: 'Stelle sicher, dass du eine stabile Internetverbindung hast.'
            },
            {
              id: 's2',
              title: 'Download der KOSMA-Software',
              content: "Klicke auf 'Download'. Der Download startet selbständig. Wenn dies nicht der Fall ist, rechtsklicke und wähle 'Speichern unter'.",
              media: {
                kind: 'image',
                bucket: 'help-assets',
                path: 'installation/download-btn.png',
                alt: 'Download Button'
              },
              warning: 'Auf Mac-Geräten musst du möglicherweise die Installation in den Sicherheitseinstellungen explizit erlauben.'
            },
            {
              id: 's3',
              title: 'Installation der KOSMA-Software',
              content: 'Öffne die heruntergeladene Datei (Installer). Der Installationsvorgang führt dich durch die nötigen Schritte.',
            },
            {
              id: 's4',
              title: 'Starten und Einloggen',
              content: 'Nach der Installation öffnet sich KOSMA automatisch. Gib deine E-Mail Adresse ein, um den "Magic Link" für den Login zu erhalten.',
            }
          ]
        }
      },
      {
        id: 'interface',
        title: 'Die Benutzeroberfläche verstehen',
        roles: ['Produktion', 'Herstellungsleitung'],
        entry: {
          id: 'entry-interface',
          summary: 'Lerne die wichtigsten Bereiche kennen: Projektliste, Navigation und Detail-Ansichten.',
          steps: [
            { id: 's1', title: 'Dashboard', content: 'Hier siehst du alle deine aktiven Projekte.' },
            { id: 's2', title: 'Sidebar', content: 'Über die linke Leiste navigierst du zwischen den Modulen (Budget, Kostenstand, etc.).' }
          ]
        }
      }
    ]
  },
  {
    id: 'budgeting',
    title: 'Budgeting',
    iconKey: 'Calculator',
    description: 'Create budgets, edit items, and use templates.',
    articles: [
      {
        id: 'create-budget',
        title: 'Ein neues Budget erstellen',
        roles: ['Produktion', 'Herstellungsleitung'],
        entry: {
          id: 'entry-create-budget',
          summary: 'Erstelle ein Budget basierend auf einer leeren Vorlage oder importiere bestehende Daten.',
          steps: [
            { id: 's1', title: 'Neues Projekt anlegen', content: 'Klicke im Dashboard auf "+ Neues Projekt".' },
            { id: 's2', title: 'Währung wählen', content: 'Lege die Basiswährung für dein Projekt fest (z.B. EUR).' }
          ]
        }
      }
    ]
  },
  {
    id: 'financing',
    title: 'Financing',
    iconKey: 'PieChart',
    description: 'Financing plans and funding structures.',
    articles: []
  },
  {
    id: 'cash-flow',
    title: 'Cash Flow',
    iconKey: 'Coins',
    description: 'Cash flow planning and payment schedules.',
    articles: []
  },
  {
    id: 'cost-control',
    title: 'Cost Control',
    iconKey: 'TrendingUp',
    description: 'Track actuals vs. budget and forecast updates.',
    articles: []
  },
  {
    id: 'printing',
    title: 'Printing & Sharing',
    iconKey: 'Printer',
    description: 'Export, print, and share project data.',
    articles: []
  },
  {
    id: 'admin',
    title: 'Project Management',
    iconKey: 'Settings',
    description: 'Manage projects, members, and permissions.',
    articles: []
  },
  {
    id: 'license',
    title: 'Licensing',
    iconKey: 'ShieldCheck',
    description: 'Licenses, upgrades, and cancellations.',
    articles: []
  },
  {
    id: 'faq',
    title: 'FAQ',
    iconKey: 'CircleHelp',
    description: 'Frequently asked questions.',
    articles: []
  }
];
