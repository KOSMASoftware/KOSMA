
import { HelpMedia, UserRoleFilter } from './taxonomy';

export interface LearningStep {
  id: string;
  title: string;
  content: string; // Supports [[kb:id]] syntax
  media?: HelpMedia;
  warning?: string;
  tip?: string;
}

export interface LearningArticle {
  id: string;
  title: string;
  roles: UserRoleFilter[];
  difficulty: 'beginner' | 'advanced' | 'expert';
  durationMin: number;
  relatedKnowledgeIds?: string[];
  entry: {
    summary: string;
    steps: LearningStep[];
  };
}

export interface LearningCategory {
  id: string;
  title: string;
  iconKey: string;
  description: string;
  articles: LearningArticle[];
}

export const LEARNING_DATA: LearningCategory[] = [
  {
    id: 'first-steps',
    title: 'Erste Schritte',
    iconKey: 'Rocket',
    description: 'Der perfekte Start in KOSMA.',
    articles: [
      {
        id: 'registration',
        title: 'Konto eröffnen & Software installieren',
        roles: ['all'],
        difficulty: 'beginner',
        durationMin: 5,
        relatedKnowledgeIds: ['kb-account-types', 'kb-magic-link'],
        entry: {
          summary: 'Lade die Software herunter und registriere dich in wenigen Minuten.',
          steps: [
            {
              id: 's1',
              title: 'Download',
              content: 'Öffne [[kb:website]] und klicke auf "Download".'
            },
            {
              id: 's2',
              title: 'Installation',
              content: 'Führe den Installer aus. Auf macOS musst du ggf. die Sicherheitseinstellungen anpassen.'
            },
            {
              id: 's3',
              title: 'Login',
              content: 'Gib deine E-Mail ein. Du erhältst einen [[kb:magic-link]] für den passwortlosen Zugang.',
              tip: 'Prüfe deinen Spam-Ordner, falls die Mail nicht ankommt.'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'budgeting',
    title: 'Kalkulation',
    iconKey: 'Calculator',
    description: 'Budgets erstellen und verwalten.',
    articles: [
      {
        id: 'create-budget',
        title: 'Ein neues Budget erstellen',
        roles: ['producer', 'line-producer'],
        difficulty: 'beginner',
        durationMin: 10,
        relatedKnowledgeIds: ['kb-budget-structure', 'kb-currency'],
        entry: {
          summary: 'Erstelle dein erstes Projekt-Budget.',
          steps: [
            { id: 's1', title: 'Projekt anlegen', content: 'Klicke im Dashboard auf "+ Neues Projekt".' },
            { id: 's2', title: 'Währung wählen', content: 'Wähle die Basiswährung. Mehr dazu unter [[kb:currency]].' }
          ]
        }
      },
      {
        id: 'advanced-markup',
        title: 'Markups & Handlungskosten',
        roles: ['line-producer', 'accountant'],
        difficulty: 'advanced',
        durationMin: 15,
        relatedKnowledgeIds: ['kb-markups', 'kb-fringes'],
        entry: {
          summary: 'Konfiguriere komplexe Aufschläge für HU und Gewinn.',
          steps: [
            { id: 's1', title: 'Global Settings', content: 'Öffne die Projekteinstellungen.' },
            { id: 's2', title: 'Markup Definition', content: 'Definiere Prozentsätze für [[kb:markups]].' }
          ]
        }
      }
    ]
  }
];
