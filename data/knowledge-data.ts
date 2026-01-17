
import { HelpMedia } from './taxonomy';

export interface KnowledgeSection {
  heading: string;
  body: string; // Markdown-like, supports [[kb:id]] and [[learn:id]]
  media?: HelpMedia;
  type?: 'definition' | 'example' | 'technical';
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  synonyms?: string[]; // For better search
  categoryId: string;
  relatedLearningIds?: string[];
  content: {
    definition: string;
    sections: KnowledgeSection[];
  };
}

export interface KnowledgeCategory {
  id: string;
  title: string;
  iconKey: string;
  description: string;
}

export const KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
  { id: 'core', title: 'Core Concepts', iconKey: 'BookOpen', description: 'Grundbegriffe der Filmfinanzierung' },
  { id: 'interface', title: 'Interface', iconKey: 'LayoutDashboard', description: 'Bedienung der KOSMA Software' },
  { id: 'finance', title: 'Finance & Tax', iconKey: 'PieChart', description: 'Währungen, Steuern und Cashflow' }
];

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'kb-magic-link',
    title: 'Magic Link',
    categoryId: 'interface',
    synonyms: ['Login', 'Passwort', 'Auth'],
    relatedLearningIds: ['registration'],
    content: {
      definition: 'Ein Magic Link ist ein temporärer, einmaliger URL, der per E-Mail versendet wird und den Benutzer authentifiziert, ohne dass ein Passwort eingegeben werden muss.',
      sections: [
        {
          heading: 'Funktionsweise',
          body: 'Anstatt sich ein Passwort zu merken, geben Sie beim Login Ihre E-Mail-Adresse ein. KOSMA sendet Ihnen eine E-Mail mit einem Button. Ein Klick darauf loggt Sie sofort auf dem Gerät ein.',
          type: 'technical'
        },
        {
          heading: 'Sicherheit',
          body: 'Magic Links sind sicherer als schwache Passwörter, da sie nur Zugriff auf das E-Mail-Konto erfordern und nach kurzer Zeit (meist 15 Minuten) ablaufen.'
        }
      ]
    }
  },
  {
    id: 'kb-budget-structure',
    title: 'Budget Struktur (Top-Sheet)',
    categoryId: 'core',
    synonyms: ['Kontenrahmen', 'Ebene', 'Account'],
    relatedLearningIds: ['create-budget'],
    content: {
      definition: 'Die hierarchische Gliederung der Produktionskosten, unterteilt in Hauptkategorien (Above-the-Line, Below-the-Line) und Detailkonten.',
      sections: [
        {
          heading: 'Ebenen',
          body: 'Ein KOSMA Budget besteht aus drei Ebenen: 1. Top-Sheet (Zusammenfassung), 2. Account (Konto), 3. Detail (Einzelpositionen).',
          type: 'definition'
        }
      ]
    }
  },
  {
    id: 'kb-markups',
    title: 'Markups (Handlungskosten)',
    categoryId: 'finance',
    synonyms: ['HU', 'Gewinn', 'Overhead', 'Markup'],
    relatedLearningIds: ['advanced-markup'],
    content: {
      definition: 'Prozentuale Aufschläge auf Netto-Kosten, die Gemeinkosten (Handlungskosten) oder Gewinnmargen der Produktion abbilden.',
      sections: [
        {
          heading: 'Berechnung',
          body: 'Markups werden in der Regel kumulativ oder auf Basis einer definierten Kostenbasis (z.B. "Alles außer Gagen") berechnet.',
          type: 'technical'
        }
      ]
    }
  },
  {
    id: 'kb-currency',
    title: 'Basiswährung & Multi-Currency',
    categoryId: 'finance',
    synonyms: ['Währung', 'Wechselkurs', 'Forex'],
    relatedLearningIds: ['create-budget'],
    content: {
      definition: 'Die Währung, in der das Hauptbudget rapportiert wird.',
      sections: [
        {
          heading: 'Wichtig',
          body: 'Die Basiswährung kann nach Erstellung des Projekts nicht mehr geändert werden.',
          type: 'technical'
        }
      ]
    }
  },
  {
    id: 'kb-website',
    title: 'KOSMA Website',
    categoryId: 'interface',
    content: {
      definition: 'Die öffentliche Seite unter www.kosma.io.',
      sections: []
    }
  }
];
