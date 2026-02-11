
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Monitor, HardDrive, WifiOff, Laptop } from 'lucide-react';
import { PlanTier } from '../types';
import { useAuth } from '../context/AuthContext';
import { STRIPE_LINKS } from '../config/stripe';
import { MarketingLayout } from '../components/layout/MarketingLayout';
import { Card } from '../components/ui/Card';
import { PLANS } from '../data/plans';
import { H1, H3, H4, H5, Paragraph, Label, Small } from '../components/ui/Typography';

export const Pricing: React.FC = () => {
  const [billingInterval, setBillingInterval] = useState<'yearly' | 'monthly'>('yearly');
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleSelectPlan = (planName: PlanTier) => {
    if (planName === PlanTier.FREE) {
        if (isAuthenticated) navigate('/dashboard');
        else navigate('/signup');
        return;
    }

    if (!isAuthenticated) {
        navigate('/signup?plan=' + planName + '&cycle=' + billingInterval);
        return;
    }

    const link = (STRIPE_LINKS as any)[planName]?.[billingInterval];
    if (link && user) {
        const url = new URL(link);
        url.searchParams.set('client_reference_id', user.id);
        url.searchParams.set('prefilled_email', user.email);
        window.location.href = url.toString();
    } else {
        console.error("No Stripe link found for", planName, billingInterval);
        navigate('/dashboard/subscription');
    }
  };

  return (
    <MarketingLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <H1 className="mb-6">
          Simple, transparent pricing
        </H1>
        <Paragraph className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto font-medium">
          Choose the plan that fits your production needs. Professional tools for modern film production.
        </Paragraph>
        
        {/* TOGGLE */}
        <div className="flex justify-center mb-12" id="pricing">
          <div className="inline-flex bg-white rounded-full p-1.5 shadow-sm border border-gray-200">
            <button onClick={() => setBillingInterval('yearly')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${billingInterval === 'yearly' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}>Yearly</button>
            <button onClick={() => setBillingInterval('monthly')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${billingInterval === 'monthly' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}>Monthly</button>
          </div>
        </div>

        {/* PRICING CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 items-start">
          {PLANS.map((plan, idx) => {
            const price = billingInterval === 'yearly' ? plan.priceYearly : plan.priceMonthly;
            // Free plan logic overrides
            const isFree = plan.name === PlanTier.FREE;
            const btnText = isFree ? (isAuthenticated ? "Current Plan" : "Get Started") : (isAuthenticated ? `Switch to ${plan.title}` : "Get Started");
            const saveText = !isFree && billingInterval === 'yearly' && plan.saveYearly ? `Save ${plan.saveYearly}€ / yr` : null;

            return (
              <Card 
                key={idx} 
                color={plan.color}
                interactive
                enableLedEffect={true}
                className="h-full transform transition-all hover:-translate-y-2 hover:shadow-2xl duration-300 p-6 rounded-2xl"
              >
                {/* Title now H4 based on logic check (20px) */}
                <H4 className={`${plan.textClass} mb-4 text-center`}>{plan.title}</H4>
                
                <div className="flex justify-center mb-6">
                  <plan.Icon className={`w-10 h-10 ${plan.textClass} opacity-90`} />
                </div>

                <Small className="h-10 mb-6 block text-center leading-relaxed px-2 font-medium">{plan.subtitle}</Small>
                
                <div className="mb-2 text-center">
                   {/* Prices are special, keep ad-hoc or use H3 */}
                   <span className={`text-3xl font-black ${plan.textClass}`}>{price} €</span>
                   <span className="text-xs text-gray-400 font-bold ml-1">{billingInterval === 'yearly' ? '/year' : '/month'}</span>
                </div>

                <div className="h-6 mb-6 flex justify-center">
                  {saveText && (
                      <H5 className="text-gray-900 bg-gray-100 px-3 py-1.5 rounded-full border-none">
                          {saveText}
                      </H5>
                  )}
                </div>

                <button 
                  onClick={() => handleSelectPlan(plan.name)} 
                  className={`w-full py-3 rounded-xl border-2 font-black text-xs transition-all mb-6 shadow-sm ${plan.btnClass}`}
                >
                    {btnText}
                </button>

                <div className="border-t border-gray-100 pt-6 flex-1">
                  <ul className="space-y-3 text-left text-xs font-medium text-gray-600">
                      {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex gap-2 items-start">
                          <Check className={`w-3.5 h-3.5 ${plan.textClass} shrink-0 mt-0.5`} />
                          <Label className="text-xs leading-tight">{feat}</Label>
                      </li>
                      ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>

        {/* TECHNICAL FACTS - Compact Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
             {/* Box 1 */}
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex gap-4 items-start hover:border-slate-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white text-slate-500 flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
                    <Monitor className="w-5 h-5" />
                </div>
                <div>
                    <Label className="text-slate-900 text-sm mb-1 block font-bold">Cross-Platform</Label>
                    <Paragraph className="text-slate-500 text-xs">
                        It runs on Mac and Windows equally.
                    </Paragraph>
                </div>
             </div>

             {/* Box 2 */}
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex gap-4 items-start hover:border-slate-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white text-slate-500 flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
                    <HardDrive className="w-5 h-5" />
                </div>
                <div>
                    <Label className="text-slate-900 text-sm mb-1 block font-bold">Local & Secure</Label>
                    <Paragraph className="text-slate-500 text-xs">
                        KOSMA stores your data locally on your machine and on the KOSMA server for you to share with other project members.
                    </Paragraph>
                </div>
             </div>

             {/* Box 3 */}
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex gap-4 items-start hover:border-slate-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white text-slate-500 flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
                    <WifiOff className="w-5 h-5" />
                </div>
                <div>
                    <Label className="text-slate-900 text-sm mb-1 block font-bold">Offline Ready</Label>
                    <Paragraph className="text-slate-500 text-xs">
                        No internet, no problem – KOSMA runs offline as desktop app, not in a browser.
                    </Paragraph>
                </div>
             </div>

             {/* Box 4 */}
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex gap-4 items-start hover:border-slate-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white text-slate-500 flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
                    <Laptop className="w-5 h-5" />
                </div>
                <div>
                    <Label className="text-slate-900 text-sm mb-1 block font-bold">Flexible Licensing</Label>
                    <Paragraph className="text-slate-500 text-xs">
                        One KOSMA license runs on a maximum of two computers.
                    </Paragraph>
                </div>
             </div>
        </div>

      </div>
    </MarketingLayout>
  );
};
