
import React, { useState } from 'react';
import { 
  Search, BookOpen, MessageCircle, FileText, ChevronDown, ChevronUp, 
  PlayCircle, Mail, ExternalLink, LifeBuoy 
} from 'lucide-react';

const FaqItem = ({ question, answer }: { question: string; answer: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl bg-white overflow-hidden transition-all duration-300 hover:shadow-md">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-6 text-left"
      >
        <span className="font-bold text-gray-900">{question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-brand-500" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
};

export const HelpPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header Section */}
      <div className="text-center mb-12 pt-8">
        <div className="inline-flex p-4 rounded-full bg-brand-50 text-brand-500 mb-6">
          <LifeBuoy className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">How can we help you?</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Search our knowledge base or browse the most frequent questions regarding KOSMA production workflows.
        </p>

        {/* Search Bar (Visual Only) */}
        <div className="mt-8 max-w-lg mx-auto relative">
          <input 
            type="text" 
            placeholder="Search for articles, e.g. 'Budgeting'..." 
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-black text-gray-900 mb-2">Documentation</h3>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">Detailed guides on how to use the Budgeting, Cost Control and Financing modules.</p>
          <span className="text-xs font-bold text-brand-500 flex items-center gap-1">Read Docs <ExternalLink className="w-3 h-3" /></span>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <PlayCircle className="w-6 h-6" />
          </div>
          <h3 className="font-black text-gray-900 mb-2">Video Tutorials</h3>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">Watch step-by-step videos to master complex production scenarios.</p>
          <span className="text-xs font-bold text-brand-500 flex items-center gap-1">Watch Now <ExternalLink className="w-3 h-3" /></span>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-black text-gray-900 mb-2">Billing & Account</h3>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">Manage your subscription, download invoices and update billing details.</p>
          <span className="text-xs font-bold text-brand-500 flex items-center gap-1">Go to Portal <ExternalLink className="w-3 h-3" /></span>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-black text-gray-900 mb-8 px-2">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <FaqItem 
            question="How do I upgrade my plan?" 
            answer="You can upgrade your plan at any time in the 'Subscription' tab. Changes are applied immediately and charged on a pro-rata basis." 
          />
          <FaqItem 
            question="Can I share projects with other users?" 
            answer="Yes, project sharing is available on the 'Budget' tier and higher. Simply invite users via their email address in the project settings." 
          />
          <FaqItem 
            question="How do I export my budget?" 
            answer="Open your project, navigate to the 'Reports' section, and choose 'Export PDF'. You can customize the columns and layout before generating the file." 
          />
          <FaqItem 
            question="Is my data secure?" 
            answer="Absolutely. We use industry-standard encryption for all data in transit and at rest. Your payment data is handled securely by Stripe." 
          />
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-black mb-2">Still need support?</h2>
            <p className="text-gray-400 text-sm max-w-sm">Our support team is available Mon-Fri from 9am to 6pm CET to assist you with any technical issues.</p>
          </div>
          <button className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-black text-sm hover:bg-brand-500 hover:text-white transition-all shadow-lg flex items-center gap-3">
            <Mail className="w-5 h-5" /> Contact Support
          </button>
        </div>
      </div>

    </div>
  );
};
