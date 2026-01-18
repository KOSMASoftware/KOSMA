
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Users, Calculator, BarChart3, Clapperboard, Monitor, HardDrive, WifiOff, Laptop } from 'lucide-react';
import { PlanTier } from '../types';
import { useAuth } from '../context/AuthContext';
import { STRIPE_LINKS } from '../config/stripe';
import { MarketingLayout } from '../components/layout/MarketingLayout';
import { Card } from '../components/ui/Card';

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

  const plans = [
    {
      name: PlanTier.FREE,
      title: "Free",
      Icon: Users,
      subtitle: "For everyone who wants to try it out",
      price: 0,
      color: "#1F2937", // Gray-800
      textClass: "text-gray-800",
      btnClass: "border-gray-800 text-gray-900 hover:bg-gray-50",
      btnText: isAuthenticated ? "Current Plan" : "Get Started",
      save: null,
      features: [
        "14-day full feature trial",
        "View project data in all modules",
        "No printing",
        "No sharing"
      ]
    },
    {
      name: PlanTier.BUDGET,
      title: "Budget",
      Icon: Calculator,
      subtitle: "For production managers focused on budget creation.",
      price: billingInterval === 'yearly' ? 390 : 39,
      color: "#F59E0B", // Amber-500
      textClass: "text-amber-500",
      btnClass: "border-amber-500 text-amber-600 bg-amber-50 hover:bg-amber-100",
      btnText: isAuthenticated ? "Switch to Budget" : "Get Started",
      save: billingInterval === 'yearly' ? 78 : null,
      features: [
        "Budgeting Module",
        "Tutorials",
        "Unlimited Projects",
        "Share Projects",
        "Email support"
      ]
    },
    {
      name: PlanTier.COST_CONTROL,
      title: "Cost Control",
      Icon: BarChart3,
      subtitle: "For production managers monitoring production costs.",
      price: billingInterval === 'yearly' ? 590 : 59,
      color: "#9333EA", // Purple-600
      textClass: "text-purple-600",
      btnClass: "border-purple-600 text-purple-700 bg-purple-50 hover:bg-purple-100",
      btnText: isAuthenticated ? "Switch to Cost Control" : "Get Started",
      save: billingInterval === 'yearly' ? 238 : null,
      features: [
        "Budgeting Module",
        "Cost Control Module",
        "Tutorials",
        "Unlimited Projects",
        "Share projects",
        "Email support"
      ]
    },
    {
      name: PlanTier.PRODUCTION,
      title: "Production",
      Icon: Clapperboard,
      subtitle: "For producers seeking full project control.",
      price: billingInterval === 'yearly' ? 690 : 69,
      color: "#16A34A", // Green-600
      textClass: "text-green-600",
      btnClass: "border-green-600 text-green-700 bg-green-50 hover:bg-green-100",
      btnText: isAuthenticated ? "Switch to Production" : "Get Started",
      save: billingInterval === 'yearly' ? 378 : null,
      features: [
        "Budgeting Module",
        "Cost Control Module",
        "Financing Module",
        "Cashflow Module",
        "Tutorials",
        "Unlimited Projects",
        "Share projects",
        "Email support"
      ]
    }
  ];

  return (
    <MarketingLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-gray-500 mb-16 max-w-2xl mx-auto leading-relaxed">
          Choose the plan that fits your production needs. Professional tools for modern film production.
        </p>
        
        {/* TOGGLE */}
        <div className="flex justify-center mb-16" id="pricing">
          <div className="inline-flex bg-white rounded-full p-1.5 shadow-sm border border-gray-200">
            <button onClick={() => setBillingInterval('yearly')} className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${billingInterval === 'yearly' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}>Yearly</button>
            <button onClick={() => setBillingInterval('monthly')} className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${billingInterval === 'monthly' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}>Monthly</button>
          </div>
        </div>

        {/* PRICING CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24 items-start">
          {plans.map((plan, idx) => (
            <Card 
              key={idx} 
              color={plan.color}
              interactive
              enableLedEffect={true}
              className="h-full transform transition-all hover:-translate-y-2 hover:shadow-2xl duration-300"
            >
              <h3 className={`text-2xl font-black ${plan.textClass} mb-4 tracking-tight`}>{plan.title}</h3>
              
              <div className="flex justify-center mb-6">
                <plan.Icon className={`w-12 h-12 ${plan.textClass} opacity-90`} />
              </div>

              <p className="text-xs text-gray-500 h-10 mb-6 leading-relaxed px-2 font-medium">{plan.subtitle}</p>
              
              <div className="mb-2">
                 <span className={`text-4xl font-black ${plan.textClass}`}>{plan.price} €</span>
                 <span className="text-sm text-gray-400 font-bold ml-1">{billingInterval === 'yearly' ? '/year' : '/month'}</span>
              </div>

              <div className="h-6 mb-8">
                {plan.save && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 bg-gray-100 px-3 py-1.5 rounded-full">
                        Save {plan.save}€ / yr
                    </span>
                )}
              </div>

              <button 
                onClick={() => handleSelectPlan(plan.name)} 
                className={`w-full py-4 rounded-2xl border-2 font-black text-sm transition-all mb-8 shadow-sm ${plan.btnClass}`}
              >
                  {plan.btnText}
              </button>

              <div className="border-t border-gray-100 pt-6 flex-1">
                <ul className="space-y-3 text-left text-sm font-medium text-gray-600">
                    {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex gap-3 items-start">
                        <Check className={`w-4 h-4 ${plan.textClass} shrink-0 mt-0.5`} />
                        <span className="leading-tight">{feat}</span>
                    </li>
                    ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>

        {/* TECHNICAL FACTS - New Section matching Download Page Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
             {/* Box 1 */}
             <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 flex gap-6 items-start hover:border-slate-300 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-white text-slate-500 flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
                    <Monitor className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900 text-lg mb-2">Cross-Platform</h3>
                    <p className="text-slate-500 leading-relaxed text-sm">
                        It runs on Mac and Windows equally.
                    </p>
                </div>
             </div>

             {/* Box 2 */}
             <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 flex gap-6 items-start hover:border-slate-300 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-white text-slate-500 flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
                    <HardDrive className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900 text-lg mb-2">Local & Secure</h3>
                    <p className="text-slate-500 leading-relaxed text-sm">
                        KOSMA stores your data locally on your machine and on the KOSMA server for you to share with other project members.
                    </p>
                </div>
             </div>

             {/* Box 3 */}
             <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 flex gap-6 items-start hover:border-slate-300 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-white text-slate-500 flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
                    <WifiOff className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900 text-lg mb-2">Offline Ready</h3>
                    <p className="text-slate-500 leading-relaxed text-sm">
                        No internet, no problem – KOSMA runs offline as desktop app, not in a browser.
                    </p>
                </div>
             </div>

             {/* Box 4 */}
             <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 flex gap-6 items-start hover:border-slate-300 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-white text-slate-500 flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
                    <Laptop className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900 text-lg mb-2">Flexible Licensing</h3>
                    <p className="text-slate-500 leading-relaxed text-sm">
                        One KOSMA license runs on a maximum of two computers.
                    </p>
                </div>
             </div>
        </div>

      </div>
    </MarketingLayout>
  );
};
