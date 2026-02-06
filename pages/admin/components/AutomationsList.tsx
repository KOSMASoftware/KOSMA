import React from 'react';
import { Zap, Clock, CheckCircle } from 'lucide-react';

const AUTOMATIONS = [
    { name: "Trial Welcome Series", segment: "trial_active", trigger: "Signup", template: "welcome_trial", status: "active" },
    { name: "Trial Ending Soon (3 days)", segment: "trial_ending_3d", trigger: "Date Check", template: "trial_ending_warning", status: "active" },
    { name: "Winback: Cancelled Users", segment: "cancelled_or_expired", trigger: "Monthly Schedule", template: "winback_offer_v1", status: "active" },
    { name: "Engagement: Inactive 30d", segment: "inactivity_short", trigger: "Weekly Schedule", template: "we_miss_you", status: "active" },
    { name: "Upsell: Monthly to Yearly", segment: "monthly_3_periods", trigger: "Monthly Schedule", template: "upgrade_yearly_discount", status: "inactive" },
    { name: "Data Retention Warning", segment: "deletion_warning_30d", trigger: "Daily Schedule", template: "gdpr_deletion_warning", status: "active" },
];

export const AutomationsList: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {AUTOMATIONS.map((auto, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group hover:border-brand-200 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap className="w-16 h-16 text-brand-500" />
                        </div>
                        
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    auto.status === 'active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-100 text-gray-500 border border-gray-200'
                                }`}>
                                    {auto.status}
                                </span>
                            </div>
                            <h4 className="text-lg font-black text-gray-900 mb-2">{auto.name}</h4>
                            <p className="text-xs text-gray-500 font-medium mb-4">Template: <span className="font-mono text-gray-700">{auto.template}</span></p>
                        </div>

                        <div className="pt-4 border-t border-gray-50">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                    <Clock className="w-3.5 h-3.5 text-brand-500" />
                                    <span>Trigger: {auto.trigger}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                    <CheckCircle className="w-3.5 h-3.5 text-brand-500" />
                                    <span>Segment: {auto.segment}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};