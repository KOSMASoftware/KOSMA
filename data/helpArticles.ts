
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
  roles?: UserRoleFilter[]; // Role Filter
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
    id: 'project-basics',
    title: 'Projekt starten & Grundlagen',
    iconKey: 'Rocket',
    description: 'Konto einrichten, Software installieren und erste Schritte.',
    articles: [
      {
        id: 'registration',
        title: 'Registrierung Website / Konto eröffnen',
        roles: ['Produktion', 'Herstellungsleitung', 'Finanzbuchhaltung'],
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
              content: "Klicke auf 'Download'. Der Download startet selbständig.",
              media: {
                kind: 'image',
                bucket: 'help-assets',
                path: 'installation/download-btn.png',
                alt: 'Download Button'
              }
            },
            {
              id: 's3',
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
            { id: 's2', title: 'Sidebar', content: 'Über die linke Leiste navigierst du zwischen den Modulen.' }
          ]
        }
      }
    ]
  },
  {
    id: 'budgeting',
    title: 'Kalkulation erstellen',
    iconKey: 'Calculator',
    description: 'Budgets aufsetzen, Währungen wählen und Positionen erfassen.',
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
    title: 'Finanzierungsplan erstellen',
    iconKey: 'PieChart',
    description: 'Finanzierungsquellen definieren und zuweisen.',
    articles: [] // Platzhalter für Content-Matrix
  },
  {
    id: 'cash-flow',
    title: 'Cash Flow planen',
    iconKey: 'Coins',
    description: 'Zahlungsflüsse steuern und Liquidität sichern.',
    articles: [] // Platzhalter für Content-Matrix
  },
  {
    id: 'cost-control',
    title: 'Kosten kontrollieren',
    iconKey: 'TrendingUp',
    description: 'Soll/Ist-Vergleiche und Kostenstand-Updates.',
    articles: [] // Platzhalter für Content-Matrix
  },
  {
    id: 'reporting',
    title: 'Teilen & Ausgeben',
    iconKey: 'Printer',
    description: 'Berichte exportieren, drucken und Projekte teilen.',
    articles: [] // Platzhalter für Content-Matrix
  }
];
