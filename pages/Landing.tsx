import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Monitor, Puzzle, WifiOff, Linkedin, Globe } from 'lucide-react';
import { PlanTier } from '../types';

export const Landing: React.FC = () => {
  const [billingInterval, setBillingInterval] = useState<'yearly' | 'monthly'>('yearly');

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
      price: 390,
      period: "/year",
      color: "border-tier-budget",
      textColor: "text-tier-budget",
      save: "Save 78€ per year",
      btnText: "Get Started",
      features: [
        { text: "Budgeting Module", check: true, color: true },
        { text: "Tutorials", check: true },
        { text: "Unlimited Projects", check: true },
        { text: "Share Projects", check: true },
        { text: "Tutorials", check: true },
        { text: "Email support", check: true },
      ]
    },
    {
      name: PlanTier.COST_CONTROL,
      title: "Cost Control",
      icon: "👩‍💼",
      subtitle: "For production managers monitoring production costs.",
      price: 590,
      period: "/year",
      color: "border-tier-cost",
      textColor: "text-tier-cost",
      save: "Save 238€ per year",
      btnText: "Get Started",
      features: [
        { text: "Budgeting Module", check: true, color: true },
        { text: "Cost Control Module", check: true, color: true },
        { text: "Tutorials", check: true },
        { text: "Unlimited Projects", check: true },
        { text: "Share projects", check: true },
        { text: "Tutorials", check: true },
        { text: "Email support", check: true },
      ]
    },
    {
      name: PlanTier.PRODUCTION,
      title: "Production",
      icon: "🎬",
      subtitle: "For producers seeking full project control.",
      price: 690,
      period: "/year",
      color: "border-tier-production",
      textColor: "text-tier-production",
      save: "Save 378€ per year",
      btnText: "Get Started",
      features: [
        { text: "Budgeting Module", check: true, color: true },
        { text: "Cost Control Module", check: true, color: true },
        { text: "Financing Module", check: true, color: true },
        { text: "Cashflow Module", check: true, color: true },
        { text: "Tutorials", check: true },
        { text: "Unlimited Projects", check: true },
        { text: "Share projects", check: true },
        { text: "Tutorials", check: true },
        { text: "Email support", check: true },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold text-brand-500 tracking-wide">KOSMA</Link>
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
            <Link to="#" className="hover:text-brand-500">Pricing</Link>
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
        {/* Header */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Compare plans and pricing
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Use it free, forever. Or upgrade to share and print projects.
        </p>

        {/* Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-white rounded-full border border-gray-200 p-1">
            <button 
              onClick={() => setBillingInterval('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingInterval === 'yearly' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Yearly
            </button>
            <button 
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingInterval === 'monthly' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Monthly
            </button>
          </div>
        </div>
        
        {billingInterval === 'yearly' && (
           <p className="text-brand-500 text-sm font-medium mb-12">Save up to 35% by taking an annual license.</p>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {plans.map((plan, idx) => (
            <div key={idx} className={`bg-white rounded-lg shadow-sm border-t-8 ${plan.color} p-6 flex flex-col h-full hover:shadow-lg transition-shadow`}>
              <div className="text-center mb-6">
                <h3 className={`text-2xl font-bold ${plan.textColor} mb-2`}>{plan.title}</h3>
                <div className="text-4xl mb-2">{plan.icon}</div>
                <p className="text-xs text-gray-500 h-10 flex items-center justify-center px-4">{plan.subtitle}</p>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-1">
                  <span className={`text-3xl font-bold ${plan.textColor}`}>{plan.price} €</span>
                  {plan.price > 0 && <span className="text-sm text-gray-500">{plan.period}</span>}
                </div>
              </div>

              <ul className="space-y-3 text-left text-sm mb-8 flex-1 pl-4">
                {plan.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3">
                    {feat.check ? (
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${feat.color ? plan.textColor : 'text-gray-400'}`} />
                    ) : (
                      <X className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                    )}
                    <span className={feat.color ? `font-medium ${plan.textColor}` : 'text-gray-600'}>
                      {feat.text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <Link 
                  to="/signup"
                  className={`block w-full py-2 px-4 rounded border transition-colors text-sm font-medium ${
                     plan.price === 0 
                     ? 'border-gray-900 text-gray-900 hover:bg-gray-50' 
                     : `${plan.color.replace('border-', 'border-')} ${plan.textColor} bg-white hover:bg-gray-50 border`
                  }`}
                  style={{ borderColor: 'currentColor' }}
                >
                  {plan.btnText}
                </Link>
                {plan.save && <p className="text-xs font-bold text-gray-900 mt-3">{plan.save}</p>}
                {plan.price === 0 && <p className="text-xs font-bold text-gray-900 mt-3">Free forever</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-20">
          <div className="bg-white p-6 rounded-lg border border-gray-100 flex items-start gap-4 text-left shadow-sm">
            <div className="text-brand-500 shrink-0">
               <div className="flex gap-1">
                 <Monitor className="w-8 h-8" />
               </div>
            </div>
            <p className="text-sm text-gray-600 pt-1">It runs on Mac and Windows equally.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-100 flex items-start gap-4 text-left shadow-sm">
            <div className="text-brand-500 shrink-0">
               <Puzzle className="w-8 h-8" />
            </div>
            <p className="text-sm text-gray-600 pt-1">
              KOSMA stores your data locally on your machine and on the KOSMA server for you to share with other project members.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-100 flex items-start gap-4 text-left shadow-sm">
             <div className="text-brand-500 shrink-0">
               <WifiOff className="w-8 h-8" />
            </div>
            <p className="text-sm text-gray-600 pt-1">
              No internet, no problem – KOSMA runs offline as desktop app, not in a browser.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-100 flex items-start gap-4 text-left shadow-sm">
             <div className="text-brand-500 shrink-0">
               <span className="text-3xl font-bold">$</span>
            </div>
            <p className="text-sm text-gray-600 pt-1">
              One KOSMA license runs on a maximum of two computers.
            </p>
          </div>
        </div>

        {/* Decorative Dots */}
        <div className="flex justify-center gap-2 mb-20 opacity-20">
            {[...Array(12)].map((_,i) => <div key={i} className="w-2 h-2 rounded-full bg-gray-400"></div>)}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12 text-sm text-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
             <div>
               <h4 className="text-brand-500 mb-4">Headstart Media</h4>
               <div className="w-24 h-12 bg-blue-900 text-white text-[10px] p-1 flex items-end justify-center leading-tight mb-4">
                 MEDIA EUROPE LOVES CINEMA
               </div>
               <Linkedin className="w-6 h-6 text-brand-600" />
             </div>
             
             <div>
               <h4 className="font-bold text-brand-900 mb-4 uppercase text-xs">Product</h4>
               <ul className="space-y-2">
                 <li><Link to="#" className="text-brand-500">Download</Link></li>
                 <li><Link to="#" className="text-brand-500">Register</Link></li>
                 <li><Link to="#" className="text-brand-500">Pricing</Link></li>
               </ul>
             </div>

             <div>
               <h4 className="font-bold text-brand-900 mb-4 uppercase text-xs">Support</h4>
               <ul className="space-y-2">
                 <li><Link to="#" className="text-brand-500">Help</Link></li>
                 <li><Link to="#" className="text-brand-500">Learning Campus</Link></li>
                 <li><Link to="#" className="text-brand-500">Templates</Link></li>
                 <li><Link to="#" className="text-brand-500">Request New Password</Link></li>
               </ul>
             </div>

             <div>
               <h4 className="font-bold text-brand-900 mb-4 uppercase text-xs">Language</h4>
               <ul className="space-y-2">
                 <li><Link to="#" className="text-brand-500">English</Link></li>
                 <li><Link to="#" className="text-brand-500">German</Link></li>
                 <li><Link to="#" className="text-brand-500">French</Link></li>
               </ul>
             </div>
           </div>
           
           <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
             <div className="flex gap-6">
                <Link to="#" className="text-brand-500">Imprint</Link>
                <Link to="#" className="text-brand-500">Privacy Statement</Link>
                <Link to="#" className="text-brand-500">GTC</Link>
                <Link to="#" className="text-brand-500">Cookie Settings</Link>
                <Link to="#" className="text-brand-500">Contact</Link>
             </div>
             <div>© 2023</div>
           </div>
        </div>
      </footer>
    </div>
  );
};