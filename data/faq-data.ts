
export interface FAQItem {
  id: string;
  question: string;
  answer: string; // Supports Markdown-like line breaks
  category: 'General' | 'Licensing' | 'Technical';
}

export const FAQ_DATA: FAQItem[] = [
  {
    "id": "what-is-kosma",
    "category": "General",
    "question": "What is KOSMA?",
    "answer": "KOSMA is a financial planning software for film productions that combines budgeting, financing, cash flow, and cost control in one system."
  },
  {
    "id": "who-is-it-for",
    "category": "General",
    "question": "Who is KOSMA for?",
    "answer": "For producers, production managers, line producers, and finance teams who plan, track, and report production budgets."
  },
  {
    "id": "offline-mode",
    "category": "Technical",
    "question": "Does KOSMA work without internet?",
    "answer": "Yes. KOSMA is a local desktop application. Internet is only required for updates and license verification."
  },
  {
    "id": "data-storage",
    "category": "Technical",
    "question": "Where are my data stored?",
    "answer": "All data are stored locally on your computer. There is no automatic cloud transfer."
  },
  {
    "id": "data-security",
    "category": "Technical",
    "question": "Are my data secure?",
    "answer": "Because all data are stored locally and not transferred automatically, they remain on your device. Device security (user accounts, disk encryption, backups) protects your files."
  },
  {
    "id": "system-requirements",
    "category": "Technical",
    "question": "What are the system requirements?",
    "answer": "KOSMA runs on macOS (Intel & Apple Silicon) and Windows 10/11."
  },
  {
    "id": "supported-os",
    "category": "Technical",
    "question": "Which operating systems are supported?",
    "answer": "macOS (Intel & Apple Silicon) and Windows 10/11."
  },
  {
    "id": "apple-silicon",
    "category": "Technical",
    "question": "How does KOSMA run on Apple Silicon (M1/M2/M3)?",
    "answer": "KOSMA runs on Apple Silicon. If needed, open the app’s Info panel and enable “Open using Rosetta.”"
  },
  {
    "id": "keyboard-shortcuts",
    "category": "General",
    "question": "Which keyboard shortcuts are available?",
    "answer": "Cmd/Ctrl + S: Save project\nCmd/Ctrl + W: Close project\nCmd/Ctrl + Q: Quit application\nCmd/Ctrl + P: Print\nCmd/Ctrl + Shift + S: Synchronize\nCmd/Ctrl + F: Activate search\nCmd/Ctrl + C: Copy\nCmd/Ctrl + X: Cut\nCmd/Ctrl + V: Paste\nTab: Jump to next field/item\nCtrl + Tab: Switch between navigation, editing, macro area, or tabs\nCmd/Ctrl + 1: Open Settings\nCmd/Ctrl + 2: Open Budgeting\nCmd/Ctrl + 3: Open Financing\nCmd/Ctrl + 4: Open Cash Flow\nCmd/Ctrl + 5: Open Cost Control\nCmd/Ctrl + –: Expand/Collapse all\nArrow up/down: Move one item\nEnter: Open/confirm item\nCmd/Ctrl + N: New account / new additional charge / new source / new cost item\nCmd/Ctrl + G: New group\nCmd/Ctrl + Shift + N: New subtotal / new category\nDelete: Delete selected element\nCmd/Ctrl + M: (Cost Control) move selected cost item"
  },
  {
    "id": "formulas",
    "category": "Technical",
    "question": "Which formulas can I use?",
    "answer": "Basic operations: +, -, *, /.\nIn Budgeting/Financing/Cost Control: SUM_PROD(\"producer\"), COUNT_PROD(\"producer\"), SUM_TAG(\"tag\"), COUNT_TAG(\"tag\"), ACCOUNT(\"account_number\").\nAdditional Charges: subtotals as variables (e.g., sub total → sub_total), NPC = Net Production Costs.\nFinancing: NPC, GT (Grand Total), DFFF, ACCOUNT(...). TAG/PROD work inside the financing plan (not linked to budget values).\nFringes: AccountTotal, Fringe1, Fringe2, FringeXXX."
  },
  {
    "id": "copy-paste",
    "category": "General",
    "question": "How does copy & paste work?",
    "answer": "Windows: use Cmd/Ctrl+C, Cmd/Ctrl+X, Cmd/Ctrl+V or the right‑click context menu.\nmacOS: hold CTRL, click the field, and choose the action from the context menu."
  },
  {
    "id": "pricing",
    "category": "Licensing",
    "question": "How much does a license cost?",
    "answer": "See the Pricing page for current plans and prices."
  },
  {
    "id": "license-per-user",
    "category": "Licensing",
    "question": "Does each user need a separate license?",
    "answer": "Yes. Each person needs their own license."
  },
  {
    "id": "license-devices",
    "category": "Licensing",
    "question": "How many computers can I use per license?",
    "answer": "Each license can be used on up to two computers."
  },
  {
    "id": "invoice",
    "category": "Licensing",
    "question": "How do I get an invoice?",
    "answer": "Invoices are provided via your account/portal. If you need help, contact Support."
  },
  {
    "id": "cancel",
    "category": "Licensing",
    "question": "When and how can I cancel?",
    "answer": "Please contact Support to cancel your license."
  },
  {
    "id": "refund",
    "category": "Licensing",
    "question": "Can I return the license if I don’t like it?",
    "answer": "Please contact Support to check whether a refund is possible in your case."
  },
  {
    "id": "upgrade-downgrade",
    "category": "Licensing",
    "question": "How can I upgrade or downgrade?",
    "answer": "Upgrades and downgrades can be initiated via Support."
  },
  {
    "id": "support",
    "category": "General",
    "question": "How can I reach Support?",
    "answer": "Use the Support form, or email support@kosma.io."
  }
];
