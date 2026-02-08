export type AutomationType = 'transactional' | 'journey' | 'job' | 'system';

export interface AutomationDef {
    id: string;
    name: string;
    type: AutomationType;
    templateName: string | null; // null matches nothing in email_messages
    trigger: string;
    condition: string;
    frequency: string;
    dedupe: string;
    description?: string;
}

export const AUTOMATION_CATALOG: AutomationDef[] = [
    // --- C) Transactional (Elastic Email, event/cron nah) ---
    {
        id: '3',
        name: 'Nicht eingeloggt: Reminder 1',
        type: 'transactional',
        templateName: 'Supabase: Sign Up Reminder 1',
        trigger: 'Signup (Cron check)',
        condition: '3 Tage nach Signup + kein App-Login',
        frequency: '1x',
        dedupe: 'signup_reminder_1'
    },
    {
        id: '4',
        name: 'Nicht eingeloggt: Reminder 2',
        type: 'transactional',
        templateName: 'Supabase: Sign Up Reminder 2',
        trigger: 'Signup (Cron check)',
        condition: '7 Tage nach Signup + kein App-Login',
        frequency: '1x',
        dedupe: 'signup_reminder_2'
    },
    {
        id: '5',
        name: 'Nicht eingeloggt: Reminder 3',
        type: 'transactional',
        templateName: 'Supabase: Sign Up Reminder 3',
        trigger: 'Signup (Cron check)',
        condition: '14 Tage nach Signup + kein App-Login',
        frequency: '1x',
        dedupe: 'signup_reminder_3'
    },
    {
        id: '6',
        name: 'Trial gestartet',
        type: 'transactional',
        templateName: 'Supabase: Trial Activation',
        trigger: 'First Login',
        condition: 'hasLogin=true + licenses.status="trial"',
        frequency: '1x',
        dedupe: 'trial_activation'
    },
    {
        id: '7',
        name: 'Trial Reminder (3 Tage vor Ende)',
        type: 'transactional',
        templateName: 'Supabase: Trial Reminder 2',
        trigger: 'Cron check',
        condition: 'days_until_trial_end == 3',
        frequency: '1x',
        dedupe: 'trial_reminder_2'
    },
    {
        id: '8',
        name: 'Trial abgelaufen',
        type: 'transactional',
        templateName: 'Supabase: Trial Reminder 3 - after trial expiry',
        trigger: 'Cron check',
        condition: 'trial_end <= now',
        frequency: '1x',
        dedupe: 'trial_expired'
    },
    {
        id: '9',
        name: 'Lizenz gekauft',
        type: 'transactional',
        templateName: 'Supabase: Subscription acquired',
        trigger: 'Stündlicher Stripe-Abgleich (email-automation)',
        condition: 'Abo ist aktiv (bezahltes Stripe-Abo ist vorhanden)',
        frequency: '1x pro Abo (dedupliziert)',
        dedupe: 'subscription_acquired:<id>'
    },
    {
        id: '10',
        name: 'Upgrade',
        type: 'transactional',
        templateName: 'Supabase: Subscription Upgraded',
        trigger: 'Stündlicher Stripe-Abgleich (email-automation)',
        condition: 'Tarif/Abrechnungszeitraum wurde hochgestuft (Upgrade erkannt)',
        frequency: 'Bei Änderung (dedupliziert)',
        dedupe: 'subscription_upgraded:<id>_<time>'
    },
    {
        id: '11',
        name: 'Downgrade',
        type: 'transactional',
        templateName: 'Supabase: Subscription Downgraded',
        trigger: 'Stündlicher Stripe-Abgleich (email-automation)',
        condition: 'Tarif/Abrechnungszeitraum wurde herabgestuft (Downgrade erkannt)',
        frequency: 'Bei Änderung (dedupliziert)',
        dedupe: 'subscription_downgraded:<id>_<time>'
    },
    {
        id: '12',
        name: 'Zahlung fehlgeschlagen',
        type: 'transactional',
        templateName: 'Supabase: Payment Failed',
        trigger: 'Stripe Webhook (invoice.payment_failed)',
        condition: 'Payment failed event',
        frequency: 'Event-based',
        dedupe: 'payment_failed:<sub_id>_<period>'
    },
    {
        id: '13',
        name: 'Rechnung bezahlt',
        type: 'transactional',
        templateName: 'Supabase: KOSMA Invoice',
        trigger: 'Stündlicher Abgleich bezahlter Rechnungen (email-automation)',
        condition: 'Rechnung ist bezahlt (Status: paid)',
        frequency: '1x pro Rechnung (dedupliziert)',
        dedupe: 'invoice_paid:<invoice_id>'
    },
    {
        id: '14',
        name: 'Kündigung bestätigen',
        type: 'transactional',
        templateName: 'Supabase: Subscription Cancellation',
        trigger: 'Stripe Webhook',
        condition: 'Subscription cancelled',
        frequency: '1x pro Subscription',
        dedupe: 'subscription_cancellation:<sub_id>'
    },

    // --- D) Journeys (batch/cron) ---
    {
        id: '15',
        name: 'Reaktivierung Offer',
        type: 'journey',
        templateName: 'Supabase: Reactivation Offer',
        trigger: 'Marketing Job',
        condition: 'status="canceled"',
        frequency: '1x/Monat (solange canceled)',
        dedupe: 'reactivation_offer_<YYYY_MM>'
    },
    {
        id: '16',
        name: 'Inaktivität (Short)',
        type: 'journey',
        templateName: 'Supabase: Inactivity Short',
        trigger: 'Marketing Job',
        condition: 'last_login >= 30 Tage',
        frequency: '1x/Monat',
        dedupe: 'inactivity_short_<YYYY_MM>'
    },
    {
        id: '17',
        name: 'Inaktivität (Long)',
        type: 'journey',
        templateName: 'Supabase: Inactivity Long',
        trigger: 'Marketing Job',
        condition: 'last_login >= 90 Tage',
        frequency: '1x/Monat',
        dedupe: 'inactivity_long_<YYYY_MM>'
    },
    {
        id: '18',
        name: 'Monats -> Jahres-Upsell',
        type: 'journey',
        templateName: 'Supabase: Monthly to Yearly Offer',
        trigger: 'Automatischer Marketing-Job (täglich geprüft, monatlich dedupliziert)',
        condition: 'Aktives Monatsabo + mindestens 3 bezahlte Rechnungen in den letzten 120 Tagen',
        frequency: '1x/Monat',
        dedupe: 'monthly_to_yearly_offer_<YYYY_MM>'
    },
    {
        id: '19',
        name: 'Tipps & Tricks',
        type: 'journey',
        templateName: 'Supabase: Monthly Tips',
        trigger: 'Marketing Job',
        condition: 'Alle aktiven Nutzer',
        frequency: '1x/Monat',
        dedupe: 'monthly_tips_<YYYY_MM>'
    },
    {
        id: '20',
        name: 'Konto-Löschung Warnung 1',
        type: 'journey',
        templateName: 'Supabase: Account Deletion Warning 1',
        trigger: 'Marketing Job',
        condition: '30 Tage vor deletion_at',
        frequency: '1x',
        dedupe: 'account_deletion_warning_1_<DATE>'
    },
    {
        id: '21',
        name: 'Konto-Löschung Warnung 2',
        type: 'journey',
        templateName: 'Supabase: Account Deletion Warning 2',
        trigger: 'Marketing Job',
        condition: '7 Tage vor deletion_at',
        frequency: '1x',
        dedupe: 'account_deletion_warning_2_<DATE>'
    },
    {
        id: '22',
        name: 'Konto-Löschung Aktion',
        type: 'job',
        templateName: null, // Kein Mail, reiner DB Job
        trigger: 'System Job',
        condition: 'deletion_at <= now',
        frequency: '1x',
        dedupe: 'Hard delete'
    }
];