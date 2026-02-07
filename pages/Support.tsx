import React, { useState } from 'react';
import { MarketingLayout } from '../components/layout/MarketingLayout';
import { Send, CheckCircle, ChevronDown, ChevronUp, Search, CircleHelp } from 'lucide-react';
import { FAQ_DATA } from '../data/faq-data';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { FormField } from '../components/ui/FormField';

export const SupportPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [faqSearch, setFaqSearch] = useState('');
  
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLoading(false);
      setSuccess(true);
  };

  const filteredFaq = FAQ_DATA.filter(item => 
    item.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
    item.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <MarketingLayout>
      <div className="min-h-[calc(100vh-72px)] pb-20">
         
         {/* HERO SECTION - Light Theme */}
         <div className="text-center pt-20 pb-16 px-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="w-16 h-16 bg-brand-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-brand-500 shadow-sm border border-brand-100">
                 <CircleHelp className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 mb-6">Support Center</h1>
            <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
                How can we help you? Browse our FAQs or get in touch with our team directly.
            </p>

            {/* FAQ Search */}
            <div className="max-w-xl mx-auto mt-12 relative group z-20">
                <div className="absolute inset-0 bg-brand-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center overflow-hidden p-2 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all">
                    <Search className="w-5 h-5 text-gray-400 ml-4" />
                    <input 
                        type="text" 
                        placeholder="Search questions..." 
                        value={faqSearch}
                        onChange={e => setFaqSearch(e.target.value)}
                        className="w-full p-3 outline-none text-gray-900 font-medium placeholder:text-gray-400 text-lg bg-transparent"
                    />
                </div>
            </div>
         </div>

         {/* FAQ SECTION */}
         <div className="max-w-3xl mx-auto px-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
             <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                {filteredFaq.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {filteredFaq.map((item) => {
                            const isOpen = openFaqId === item.id;
                            return (
                                <div key={item.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                                    <button 
                                        onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                                        className="w-full text-left px-8 py-6 flex justify-between items-center gap-4 group"
                                    >
                                        <div className="flex flex-col items-start gap-1">
                                            {item.category && (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-brand-500 transition-colors">
                                                    {item.category}
                                                </span>
                                            )}
                                            <span className={`font-bold text-lg transition-colors ${isOpen ? 'text-brand-600' : 'text-gray-900'}`}>
                                                {item.question}
                                            </span>
                                        </div>
                                        {isOpen ? <ChevronUp className="w-5 h-5 text-brand-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-brand-500 shrink-0" />}
                                    </button>
                                    
                                    {isOpen && (
                                        <div className="px-8 pb-8 text-gray-600 leading-relaxed font-medium animate-in slide-in-from-top-2 whitespace-pre-wrap">
                                            {item.answer}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-400 italic">No answers found for "{faqSearch}".</div>
                )}
             </div>
         </div>

         {/* CONTACT SECTION */}
         <div className="max-w-4xl mx-auto px-6 mt-24 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
             <div className="text-center mb-12">
                 <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4">Still need help?</h2>
                 <p className="text-gray-500 text-lg">Send us a message and we'll get back to you as soon as possible.</p>
             </div>

             {success ? (
                 <div className="bg-green-50 border border-green-100 rounded-[2rem] p-12 text-center animate-in fade-in zoom-in-95 max-w-2xl mx-auto">
                     <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                     <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                     <p className="text-gray-600 mb-8">Thank you for contacting us. We will get back to you shortly.</p>
                     <Button variant="ghost" onClick={() => { setSuccess(false); setFormData({name:'', email:'', message:''}); }}>
                        Send another message
                     </Button>
                 </div>
             ) : (
                 <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                     <form onSubmit={handleSubmit} className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField label="Name">
                                 <Input 
                                    required
                                    type="text" 
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                 />
                             </FormField>
                             <FormField label="Email">
                                 <Input 
                                    required
                                    type="email" 
                                    placeholder="hello@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                 />
                             </FormField>
                         </div>
                         <FormField label="Message">
                             <TextArea 
                                required
                                rows={6}
                                placeholder="Describe your issue..."
                                value={formData.message}
                                onChange={e => setFormData({...formData, message: e.target.value})}
                             />
                         </FormField>
                         
                         <div className="pt-4">
                            <Button 
                                type="submit" 
                                isLoading={loading}
                                className="w-full"
                                icon={<Send className="w-4 h-4" />}
                            >
                                Send Message
                            </Button>
                         </div>

                         <p className="text-center text-xs text-gray-400 mt-6">
                            Alternatively, email us at <a href="mailto:support@kosma.io" className="text-brand-500 font-bold hover:underline">support@kosma.io</a>
                         </p>
                     </form>
                 </div>
             )}
         </div>
      </div>
    </MarketingLayout>
  );
};