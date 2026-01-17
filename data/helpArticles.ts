
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
  tags?: string[];
  entry: HelpEntry;
}

export interface HelpCategory {
  id: string;
  title: string;
  iconKey: string; // Changed from React Component to string key
  description?: string;
  articles: HelpArticle[];
}

export interface HelpKnowledgeBase {
  version: string;
  categories: HelpCategory[];
}

export const HELP_DATA: HelpCategory[] = [
  {
    id: 'first-steps',
    title: 'Erste Schritte',
    iconKey: 'Rocket',
    description: 'Alles für den perfekten Start in KOSMA.',
    articles: [
      {
        id: 'registration',
        title: 'Registrierung Website / Konto eröffnen',
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
    title: 'Kalkulieren',
    iconKey: 'Calculator',
    description: 'Budgets erstellen, Positionen bearbeiten und Vorlagen nutzen.',
    articles: [
      {
        id: 'create-budget',
        title: 'Ein neues Budget erstellen',
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
    title: 'Finanzierung',
    iconKey: 'PieChart',
    description: 'Finanzierungspläne und Cashflow-Management.',
    articles: []
  },
  {
    id: 'cost-control',
    title: 'Cost Control',
    iconKey: 'TrendingUp',
    description: 'Soll-Ist Vergleiche und Kostenüberwachung.',
    articles: []
  },
  {
    id: 'printing',
    title: 'Drucken & Teilen',
    iconKey: 'Printer',
    description: 'PDF Exporte, Wasserzeichen und Team-Sharing.',
    articles: []
  },
  {
    id: 'admin',
    title: 'Projektverwaltung',
    iconKey: 'Settings',
    description: 'Projekte archivieren, löschen oder umbenennen.',
    articles: []
  },
  {
    id: 'faq',
    title: 'FAQ',
    iconKey: 'CircleHelp',
    description: 'Häufig gestellte Fragen zu Account und Technik.',
    articles: []
  }
];
