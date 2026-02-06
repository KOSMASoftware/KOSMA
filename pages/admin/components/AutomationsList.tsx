import React from 'react';
import { Zap, Clock, Users, Mail } from 'lucide-react';

const AUTOMATIONS = [
    { 
        name: "Signup / Aktivierung", 
        audience: "Noch nie eingeloggt", 
        trigger: "bestehend", 
        emails: "signup_reminder_1, signup_reminder_2, signup_reminder_3" 
    },
    { 
        name: "Trial", 
        audience: "Trial aktiv", 
        trigger: "bestehend", 
        emails: "trial_activation, trial_reminder, trial_expired" 
    },
    { 
        name: "Inaktivität", 
        audience: "Eingeloggt, aber inaktiv", 
        trigger: "bestehend", 
        emails: "inactivity_*" 
    },
    { 
        name: "Konto‑Löschung – Warnung 1", 
        audience: "Nie gekauft + ≥11 Monate keine Aktivität", 
        trigger: "Datum", 
        emails: "account_deletion_warning_1" 
    },
    { 
        name: "Konto‑Löschung – Warnung 2", 
        audience: "Nie gekauft + ≥12 Monate keine Aktivität", 
        trigger: "Datum", 
        emails: "account_deletion_warning_2" 
    },
    { 
        name: "Konto‑Löschung – Aktion", 
        audience: "Nie gekauft + ≥12 Monate keine Aktivität", 
        trigger: "Frist abgelaufen", 
        emails: "ACTION: account-delete-job" 
    },
    { 
        name: "Monats → Jahres‑Upsell", 
        audience: "Aktive Monatskunden, ≥3 Perioden", 
        trigger: "bestehend", 
        emails: "monthly_to_yearly_offer" 
    },
    { 
        name: "Kündigung", 
        audience: "Gekündigt", 
        trigger: "Kündigung", 
        emails: "cancellation_confirmation" 
    },
    { 
        name: "Reaktivierung", 
        audience: "Gekündigt", 
        trigger: "bestehend", 
        emails: "reactivation_offer" 
    },
    { 
        name: "Tipps & Tricks", 
        audience: "Alle", 
        trigger: "1×/Monat", 
        emails: "monthly_tips" 
    }
];

export const AutomationsList: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {AUTOMATIONS.map((auto, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group hover:border-brand-200 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Zap className="w-16 h-16 text-brand-500" />
                        </div>
                        
                        <div className="mb-4">
                            <h4 className="text-lg font-black text-gray-900 mb-4 pr-8 leading-tight">{auto.name}</h4>
                            
                            <div className="flex items-start gap-2 mb-2">
                                <Mail className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                                <span className="text-xs text-gray-600 font-mono break-all">{auto.emails}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-50 space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                <Users className="w-3.5 h-3.5 text-gray-400" />
                                <span>{auto.audience}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                <span>Trigger: {auto.trigger}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};