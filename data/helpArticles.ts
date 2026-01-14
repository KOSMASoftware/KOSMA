
import React from 'react';
import { 
  Rocket, Calculator, PieChart, TrendingUp, Settings, CircleHelp, 
  FileText, Share2, Printer, Download 
} from 'lucide-react';

export interface HelpStep {
  title: string;
  content: string;
  image?: string; // Placeholder string for now
  warning?: string; // Optional warning box
  tip?: string; // Optional tip box
}

export interface HelpArticle {
  id: string;
  title: string;
  summary: string; // The "Abstract" box at the top
  steps: HelpStep[];
}

export interface HelpCategory {
  id: string;
  title: string;
  icon: any;
  description: string;
  articles: HelpArticle[];
}

export const HELP_DATA: HelpCategory[] = [
  {
    id: 'first-steps',
    title: 'Erste Schritte',
    icon: Rocket,
    description: 'Alles für den perfekten Start in KOSMA.',
    articles: [
      {
        id: 'registration',
        title: 'Registrierung Website / Konto eröffnen',
        summary: 'Lade zuerst die Software herunter, führe dann die Registrierung aus und bestätige diese per E-Mail. Anschließend kannst Du dich mit Deinen Daten einloggen.',
        steps: [
          {
            title: 'Zugriff auf die KOSMA Webseite',
            content: 'Öffne www.kosma.io und klicke oben rechts auf den Bereich "Download".',
            tip: 'Stelle sicher, dass du eine stabile Internetverbindung hast.'
          },
          {
            title: 'Download der KOSMA-Software',
            content: "Klicke auf 'Download'. Der Download startet selbständig. Wenn dies nicht der Fall ist, rechtsklicke und wähle 'Speichern unter'.",
            image: 'download-button-placeholder',
            warning: 'Auf Mac-Geräten musst du möglicherweise die Installation in den Sicherheitseinstellungen explizit erlauben.'
          },
          {
            title: 'Installation der KOSMA-Software',
            content: 'Öffne die heruntergeladene Datei (Installer). Der Installationsvorgang führt dich durch die nötigen Schritte.',
          },
          {
            title: 'Starten und Einloggen',
            content: 'Nach der Installation öffnet sich KOSMA automatisch. Gib deine E-Mail Adresse ein, um den "Magic Link" für den Login zu erhalten.',
          }
        ]
      },
      {
        id: 'interface',
        title: 'Die Benutzeroberfläche verstehen',
        summary: 'Lerne die wichtigsten Bereiche kennen: Projektliste, Navigation und Detail-Ansichten.',
        steps: [
          { title: 'Dashboard', content: 'Hier siehst du alle deine aktiven Projekte.' },
          { title: 'Sidebar', content: 'Über die linke Leiste navigierst du zwischen den Modulen (Budget, Kostenstand, etc.).' }
        ]
      }
    ]
  },
  {
    id: 'budgeting',
    title: 'Kalkulieren',
    icon: Calculator,
    description: 'Budgets erstellen, Positionen bearbeiten und Vorlagen nutzen.',
    articles: [
      {
        id: 'create-budget',
        title: 'Ein neues Budget erstellen',
        summary: 'Erstelle ein Budget basierend auf einer leeren Vorlage oder importiere bestehende Daten.',
        steps: [
          { title: 'Neues Projekt anlegen', content: 'Klicke im Dashboard auf "+ Neues Projekt".' },
          { title: 'Währung wählen', content: 'Lege die Basiswährung für dein Projekt fest (z.B. EUR).' }
        ]
      }
    ]
  },
  {
    id: 'financing',
    title: 'Finanzierung',
    icon: PieChart,
    description: 'Finanzierungspläne und Cashflow-Management.',
    articles: []
  },
  {
    id: 'cost-control',
    title: 'Cost Control',
    icon: TrendingUp,
    description: 'Soll-Ist Vergleiche und Kostenüberwachung.',
    articles: []
  },
  {
    id: 'printing',
    title: 'Drucken & Teilen',
    icon: Printer,
    description: 'PDF Exporte, Wasserzeichen und Team-Sharing.',
    articles: []
  },
  {
    id: 'admin',
    title: 'Projektverwaltung',
    icon: Settings,
    description: 'Projekte archivieren, löschen oder umbenennen.',
    articles: []
  },
  {
    id: 'faq',
    title: 'FAQ',
    icon: CircleHelp,
    description: 'Häufig gestellte Fragen zu Account und Technik.',
    articles: []
  }
];
