
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X, Monitor, Puzzle, WifiOff, Linkedin, Globe, ArrowRight } from 'lucide-react';
import { PlanTier } from '../types';
import { useAuth } from '../context/AuthContext';
import { STRIPE_LINKS } from '../config/stripe';

export const Landing: React.FC = () => {
  const [billingInterval, setBillingInterval] = useState<'yearly' | 'monthly'>('yearly');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSelectPlan = (planName: PlanTier) => {
    if (planName === PlanTier.FREE) {
        navigate('/signup');
        return;
    }

    if (!isAuthenticated) {
        navigate('/signup?plan=' + planName + '&cycle=' + billingInterval);
        return;
    }

    const link = (STRIPE_LINKS as any)[planName]?.[billingInterval];
    if (link && !link.includes('test_')) {
        window.location.href = link;
    } else {
        navigate('/dashboard/subscription');
    }
  };

  const plans = [
    {
      name: PlanTier.FREE,
      title: "Free",
      icon: "👥",
      subtitle: "For everyone who wants to try it out",
      price: 0,
      period: "",
      color: "border-tier-free",
      textColor: "text-tier-free",
      btnText: "Free forever",
      features: [
        { text: "14-day full feature trial", check: true },
        { text: "View project data in all modules", check: true },
        { text: "No printing", check: false },
        { text: "No sharing", check: false },
      ]
    },
    {
      name: PlanTier.BUDGET,
      title: "Budget",
      icon: "👷",
      subtitle: "For production managers focused on budget creation.",
      price: billingInterval === 'yearly' ? 390 : 39,
      period: billingInterval === 'yearly' ? "/year" : "/month",
      color: "border-tier-budget",
      textColor: "text-tier-budget",
      save: billingInterval === 'yearly' ? "Save 78€ per year" : null,
      btnText: "Get Started",
      features: [
        { text: "Budgeting Module", check: true, color: true },
        { text: "Tutorials", check: true },
        { text: "Unlimited Projects", check: true },
        { text: "Share Projects", check: true },
        { text: "Email support", check: true },
      ]
    },
    {
      name: PlanTier.COST_CONTROL,
      title: "Cost Control",
      icon: "👩‍💼",
      subtitle: "For production managers monitoring production costs.",
      price: billingInterval === 'yearly' ? 590 : 59,
      period: billingInterval === 'yearly' ? "/year" : "/month",
      color: "border-tier-cost",
      textColor: "text-tier-cost",
      save: billingInterval === 'yearly' ? "Save 238€ per year" : null,
      btnText: "Get Started",
      features: [
        { text: "Budgeting Module", check: true, color: true },
        { text: "Cost Control Module", check: true, color: true },
        { text: "Tutorials", check: true },
        { text: "Unlimited Projects", check: true },
        { text: "Share projects", check: true },
        { text: "Email support", check: true },
      ]
    },
    {
      name: PlanTier.PRODUCTION,
      title: "Production",
      icon: "🎬",
      subtitle: "For producers seeking full project control.",
      price: billingInterval === 'yearly' ? 690 : 69,
      period: billingInterval === 'yearly' ? "/year" : "/month",
      color: "border-tier-production",
      textColor: "text-tier-production",
      save: billingInterval === 'yearly' ? "Save 378€ per year" : null,
      btnText: "Get Started",
      features: [
        { text: "Budgeting Module", check: true, color: true },
        { text: "Cost Control Module", check: true, color: true },
        { text: "Financing Module", check: true, color: true },
        { text: "Cashflow Module", check: true, color: true },
        { text: "Tutorials", check: true },
        { text: "Unlimited Projects", check: true },
        { text: "Share projects", check: true },
        { text: "Email support", check: true },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold text-brand-500 tracking-wide">KOSMA</Link>
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
            <a href="#pricing" className="hover:text-brand-500">Pricing</a>
            <Link to="#" className="hover:text-brand-500">Learning Campus</Link>
            <Link to="#" className="hover:text-brand-500">Help</Link>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link to="#" className="text-brand-500 hover:underline hidden md:block">Download</Link>
          <Link to="/login" className="text-gray-900 hover:text-brand-500">Log In</Link>
          <Link to="/signup" className="bg-gray-900 text-white px-5 py-2 rounded hover:bg-gray-800 transition-colors">
            Sign Up
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Compare plans and pricing</h1>
        <div className="flex justify-center mb-6" id="pricing">
          <div className="inline-flex bg-white rounded-full border border-gray-200 p-1">
            <button onClick={() => setBillingInterval('yearly')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingInterval === 'yearly' ? 'bg-gray-900 text-white' : 'text-gray-600'}`}>Yearly</button>
            <button onClick={() => setBillingInterval('monthly')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingInterval === 'monthly' ? 'bg-gray-900 text-white' : 'text-gray-600'}`}>Monthly</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {plans.map((plan, idx) => (
            <div key={idx} className={`bg-white rounded-lg shadow-sm border-t-8 ${plan.color} p-6 flex flex-col h-full`}>
              <h3 className={`text-2xl font-bold ${plan.textColor} mb-2`}>{plan.title}</h3>
              <div className="text-4xl mb-2">{plan.icon}</div>
              <p className="text-xs text-gray-500 h-10 mb-6">{plan.subtitle}</p>
              <div className="text-3xl font-bold mb-8">{plan.price} € <span className="text-sm text-gray-400">{plan.period}</span></div>
              <ul className="space-y-3 text-left text-sm mb-8 flex-1">
                {plan.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex gap-2">
                    <Check className={`w-4 h-4 ${feat.check ? (feat.color ? plan.textColor : 'text-gray-400') : 'text-gray-200'}`} />
                    <span className={feat.color ? `font-bold ${plan.textColor}` : ''}>{feat.text}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => handleSelectPlan(plan.name)} className={`w-full py-2 rounded border font-bold ${plan.textColor} border-current`}>{plan.btnText}</button>
            </div>
          ))}
        </div>
      </main>
      
      <footer className="bg-gray-50 border-t border-gray-200 py-12 text-sm text-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
             <div className="flex gap-6">
                <Link to="/login?reset=true" className="text-brand-500 hover:underline">Passwort zurücksetzen</Link>
                <Link to="#" className="text-brand-500">Impressum</Link>
                <Link to="#" className="text-brand-500">Kontakt</Link>
             </div>
             <div>© 2023 KOSMA</div>
           </div>
        </div>
      </footer>
    </div>
  );
};
