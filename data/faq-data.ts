
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Licensing' | 'Technical';
}

export const FAQ_DATA: FAQItem[] = [
  {
    id: "offline-mode",
    category: "General",
    question: "Funktioniert KOSMA ohne Internet?",
    answer: "Ja. KOSMA ist eine Desktop-Anwendung, die primär lokal arbeitet ('Local-First'). Deine Daten werden auf deinem Rechner gespeichert. Eine Internetverbindung ist nur für Updates, die Lizenzprüfung und das Teilen von Projekten (Sync) notwendig."
  },
  {
    id: "system-reqs",
    category: "Technical",
    question: "Was sind die Systemanforderungen?",
    answer: "KOSMA läuft auf macOS (Intel & Apple Silicon) und Windows 10/11. Für eine optimale Performance empfehlen wir 8GB RAM und eine Bildschirmauflösung von mindestens 1920x1080."
  },
  {
    id: "licensing-cost",
    category: "Licensing",
    question: "Was kostet eine Lizenz?",
    answer: "Wir bieten verschiedene Pläne an, beginnend ab 39€/Monat für das Budget-Modul. Details findest du auf unserer Pricing-Seite. Die Abrechnung erfolgt wahlweise monatlich oder jährlich (mit Rabatt)."
  },
  {
    id: "licensing-users",
    category: "Licensing",
    question: "Braucht jeder Nutzer eine Lizenz?",
    answer: "Ja, KOSMA ist benutzergebunden. Jeder Nutzer benötigt eine eigene Lizenz. Eine Lizenz kann jedoch auf bis zu zwei Geräten desselben Nutzers aktiviert werden (z.B. Desktop und Laptop)."
  },
  {
    id: "invoice",
    category: "Licensing",
    question: "Wie bekomme ich eine Rechnung?",
    answer: "Rechnungen werden automatisch per E-Mail versendet. Du kannst sie jederzeit im Stripe Customer Portal (über Dashboard > Settings) einsehen und herunterladen."
  },
  {
    id: "funding",
    category: "General",
    question: "Wird KOSMA von Förderanstalten anerkannt?",
    answer: "KOSMA nutzt etablierte Industriestandards für Kalkulationen. Die Exporte (PDF/Excel) sind so gestaltet, dass sie den Anforderungen der meisten Förderanstalten und Sender entsprechen."
  }
];