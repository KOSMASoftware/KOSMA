
export interface FAQItem {
  id: string;
  question: string;
  answer: string; // Supports Markdown-like line breaks
  category: 'General' | 'Licensing' | 'Technical';
}

export const FAQ_DATA: FAQItem[] = [
  {
    "id": "faq-read-understand-01-faq-list-answers",
    "question": "FAQ list / answers",
    "answer": "FAQ list / answers helps you interpret the current state of your data on this screen.\n\nFAQ list / answers is a read-only indicator that helps you interpret the current state of your work.\n\nCheck this area after applying filters to verify what is included in your view.",
    "category": "General"
  },
  {
    "id": "faq-read-understand-02-faq-categories",
    "question": "FAQ categories",
    "answer": "FAQ categories helps you interpret the current state of your data on this screen.\n\nFAQ categories is a read-only indicator that helps you interpret the current state of your work.\n\nCheck this area after applying filters to verify what is included in your view.",
    "category": "General"
  },
  {
    "id": "faq-read-understand-03-example-topics",
    "question": "Example topics: keyboard shortcuts, formulas, copy & paste",
    "answer": "Example topics: keyboard shortcuts, formulas, copy & paste, system requirements, Apple M1 setup helps you interpret the current state of your data on this screen.\n\nCheck this area after applying filters to verify what is included in your view.",
    "category": "Technical"
  },
  {
    "id": "faq-read-understand-04-lizenz-account",
    "question": "Lizenz & Account:",
    "answer": "Lizenz & Account: helps you interpret the current state of your data on this screen.",
    "category": "Licensing"
  },
  {
    "id": "faq-read-understand-05-upgrade-downgrade",
    "question": "Ich möchte meine Lizenz upraden/downgraden",
    "answer": "Ich möchte meine Lizenz upraden/downgraden helps you interpret the current state of your data on this screen.",
    "category": "Licensing"
  },
  {
    "id": "faq-read-understand-06-cancel-license",
    "question": "Ich möchte meine Lizenz kündigen",
    "answer": "Ich möchte meine Lizenz kündigen helps you interpret the current state of your data on this screen.",
    "category": "Licensing"
  },
  {
    "id": "faq-read-understand-07-cancel-account",
    "question": "Ich möchte meinen Account kündigen",
    "answer": "Ich möchte meinen Account kündigen helps you interpret the current state of your data on this screen.",
    "category": "Licensing"
  },
  {
    "id": "faq-read-understand-08-employee-license",
    "question": "Ich möchte für Mitarbeiter eine Lizenz kaufen",
    "answer": "Ich möchte für Mitarbeiter eine Lizenz kaufen helps you interpret the current state of your data on this screen.",
    "category": "Licensing"
  },
  {
    "id": "faq-read-understand-09-system-betrieb",
    "question": "System & Betrieb:",
    "answer": "System & Betrieb: helps you interpret the current state of your data on this screen.",
    "category": "Technical"
  },
  {
    "id": "faq-read-understand-10-system-reqs",
    "question": "Was sind die Systemanforderungen?",
    "answer": "Was sind die Systemanforderungen? helps you interpret the current state of your data on this screen.",
    "category": "Technical"
  },
  {
    "id": "faq-read-understand-11-os-support",
    "question": "Auf welchen Betriebssystemen läuft KOSMA?",
    "answer": "Auf welchen Betriebssystemen läuft KOSMA? helps you interpret the current state of your data on this screen.",
    "category": "Technical"
  },
  {
    "id": "faq-read-understand-12-offline-mode",
    "question": "Funktioniert KOSMA ohne Internet?",
    "answer": "Funktioniert KOSMA ohne Internet? helps you interpret the current state of your data on this screen.",
    "category": "Technical"
  },
  {
    "id": "faq-read-understand-13-training",
    "question": "Gibt es Schulungskurse für KOSMA?",
    "answer": "Gibt es Schulungskurse für KOSMA? helps you interpret the current state of your data on this screen.",
    "category": "General"
  },
  {
    "id": "faq-read-understand-14-data-security",
    "question": "Daten & Sicherheit:",
    "answer": "Daten & Sicherheit: helps you interpret the current state of your data on this screen.",
    "category": "Technical"
  },
  {
    "id": "faq-read-understand-15-data-storage",
    "question": "Wie und wo werden die Daten gespeichert?",
    "answer": "Wie und wo werden die Daten gespeichert? helps you interpret the current state of your data on this screen.",
    "category": "Technical"
  },
  {
    "id": "faq-read-understand-16-expired-license-data",
    "question": "Was passiert mit meinen Daten wenn meine Lizenz abgelaufen ist?",
    "answer": "Was passiert mit meinen Daten wenn meine Lizenz abgelaufen ist? helps you interpret the current state of your data on this screen.",
    "category": "Licensing"
  },
  {
    "id": "faq-read-understand-17-backup-archive",
    "question": "Ich möchte ein Projekt langfristig sichern und archivieren",
    "answer": "Ich möchte ein Projekt langfristig sichern und archivieren helps you interpret the current state of your data on this screen.",
    "category": "Technical"
  },
  {
    "id": "faq-read-understand-18-billing-header",
    "question": "Lizenz & Abrechnung:",
    "answer": "Lizenz & Abrechnung: helps you interpret the current state of your data on this screen.",
    "category": "Licensing"
  },
  {
    "id": "faq-read-understand-19-license-cost",
    "question": "Was kostet eine Lizenz?",
    "answer": "Was kostet eine Lizenz? helps you interpret the current state of your data on this screen.",
    "category": "Licensing"
  },
  {
    "id": "faq-read-understand-20-user-license",
    "question": "Braucht jeder Nutzer eine Lizenz?",
    "answer": "Braucht jeder Nutzer eine Lizenz? helps you interpret the current state of your data on this screen.",
    "category": "Licensing"
  },
  {
    "id": "faq-read-understand-21-devices-per-license",
    "question": "Auf wievielen Geräten funktioniert eine Lizenz?",
    "answer": "Auf wievielen Geräten funktioniert eine Lizenz? helps you interpret the current state of your data on this screen.",
    "category": "Licensing"
  },
  {
    "id": "faq-read-understand-22-invoice",
    "question": "Wie bekomme ich eine Rechnung?",
    "answer": "Wie bekomme ich eine Rechnung? helps you interpret the current state of your data on this screen.",
    "category": "Licensing"
  },
  {
    "id": "faq-read-understand-23-support-header",
    "question": "Hilfe & Support:",
    "answer": "Hilfe & Support: helps you interpret the current state of your data on this screen.",
    "category": "General"
  },
  {
    "id": "faq-read-understand-24-using-help",
    "question": "Ich möchte die Hilfe verwenden",
    "answer": "Ich möchte die Hilfe verwenden helps you interpret the current state of your data on this screen.",
    "category": "General"
  },
  {
    "id": "faq-read-understand-25-funding-recognition",
    "question": "Wird KOSMA von Förderanstalten anerkannt?",
    "answer": "Wird KOSMA von Förderanstalten anerkannt? helps you interpret the current state of your data on this screen.",
    "category": "General"
  },
  {
    "id": "faq-change-control-01-search-filter",
    "question": "Search / filter questions",
    "answer": "Use Search / filter questions to adjust how data is displayed or calculated on this screen.\n\nSearch / filter questions changes how information is displayed or calculated in this module.\n\nToggle the setting and compare the output before and after to confirm the effect.",
    "category": "General"
  },
  {
    "id": "faq-change-control-02-configure",
    "question": "Configure",
    "answer": "Use Configure to adjust how data is displayed or calculated on this screen.\n\nConfigure changes how information is displayed or calculated in this module.\n\nToggle the setting and compare the output before and after to confirm the effect.",
    "category": "General"
  },
  {
    "id": "faq-navigate-views-01-link-kb",
    "question": "Link to KB / Learning articles",
    "answer": "Link to KB / Learning articles helps you switch views or move to related modules.\n\nLink to KB / Learning articles takes you to a different view or module without losing context.\n\nUse it to switch from Budgeting to Financing and compare the same project data.",
    "category": "General"
  },
  {
    "id": "faq-navigate-views-02-support-request",
    "question": "Support / Feature request",
    "answer": "Support / Feature request helps you switch views or move to related modules.\n\nSupport / Feature request takes you to a different view or module without losing context.\n\nUse it to switch from Budgeting to Financing and compare the same project data.",
    "category": "General"
  }
];
