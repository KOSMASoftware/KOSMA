import React, { useState } from 'react';
import { MarketingLayout } from '../components/layout/MarketingLayout';
import { Send, CheckCircle, ChevronDown, ChevronUp, Search, CircleHelp, CreditCard, Laptop, User } from 'lucide-react';
import { FAQ_DATA } from '../data/faq-data';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { FormField } from '../components/ui/FormField';
import { Card } from '../components/ui/Card';

export const SupportPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [faqSearch, setFaqSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
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

  const filteredFaq = FAQ_DATA.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
                          item.answer.toLowerCase().includes(faqSearch.toLowerCase());
    const matchesCategory = activeCategory ? item.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Helper for Category Cards
  const CategoryCard = ({ icon: Icon, title, category }: { icon: any, title: string, category: string | null }) => (
      <Card 
        className={`p-6 items-center text-center transition-all cursor-pointer hover:border-brand-200 ${activeCategory === category ? 'ring-2 ring-brand-500 border-transparent shadow-md' : ''}`}
        onClick={() => { setActiveCategory(category === activeCategory ? null : category); setFaqSearch(''); }}
        interactive
      >
          <div className={`mb-4 w-12 h-12 rounded-xl flex items-center justify-center ${activeCategory === category ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-500'}`}>
              <Icon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
      </Card>
  );

  return (
    <MarketingLayout>
      <div className="min-h-[calc(100vh-72px)] py-16 px-6">
         
         {/* HERO HEADER */}
         <div className="text-center max-w-3xl mx-auto mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 mb-4">Support Center</h1>
            <p className="text-base md:text-lg text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
                Browse topics or get in touch with our team.
            </p>
         </div>

         {/* CATEGORY CARDS */}
         <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
             <CategoryCard icon={CreditCard} title="Billing & Licenses" category="Licensing" />
             <CategoryCard icon={Laptop} title="Technical Issues" category="Technical" />
             <CategoryCard icon={User} title="General Account" category="General" />
         </div>

         {/* SEARCH & FAQ LIST */}
         <div className="max-w-3xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
             
             <div className="mb-8">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input 
                        placeholder={activeCategory ? `Search in ${activeCategory}...` : "Search all questions..."}
                        value={faqSearch}
                        onChange={e => setFaqSearch(e.target.value)}
                        className="pl-10 h-12 text-base shadow-sm border-gray-200 bg-white"
                    />
                </div>
             </div>

             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {filteredFaq.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {filteredFaq.map((item) => {
                            const isOpen = openFaqId === item.id;
                            return (
                                <div key={item.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                                    <button 
                                        onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                                        className="w-full text-left px-6 py-5 flex justify-between items-center gap-4 group"
                                    >
                                        <div className="flex flex-col items-start gap-1">
                                            <span className={`font-bold text-base transition-colors ${isOpen ? 'text-brand-600' : 'text-gray-900'}`}>
                                                {item.question}
                                            </span>
                                            {!activeCategory && (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                    {item.category}
                                                </span>
                                            )}
                                        </div>
                                        {isOpen ? <ChevronUp className="w-5 h-5 text-brand-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-brand-500 shrink-0" />}
                                    </button>
                                    
                                    {isOpen && (
                                        <div className="px-6 pb-6 text-gray-600 leading-relaxed font-medium text-sm animate-in slide-in-from-top-1 whitespace-pre-wrap">
                                            {item.answer}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-400 italic">No answers found. Try a different search term.</div>
                )}
             </div>
         </div>

         {/* CONTACT FORM */}
         <div className="max-w-2xl mx-auto mt-24 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
             <div className="text-center mb-8">
                 <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Still need help?</h2>
                 <p className="text-gray-500 text-sm font-medium">Send us a direct message.</p>
             </div>

             {success ? (
                 <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center animate-in fade-in zoom-in-95">
                     <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                     <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                     <p className="text-gray-600 mb-6 text-sm">We'll get back to you shortly.</p>
                     <Button variant="ghost" onClick={() => { setSuccess(false); setFormData({name:'', email:'', message:''}); }}>
                        Send another message
                     </Button>
                 </div>
             ) : (
                 <Card className="p-8 border-gray-200 shadow-lg">
                     <form onSubmit={handleSubmit} className="space-y-5">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                             <FormField label="Name">
                                 <Input 
                                    required
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
                                rows={5}
                                placeholder="Describe your issue..."
                                value={formData.message}
                                onChange={e => setFormData({...formData, message: e.target.value})}
                             />
                         </FormField>
                         
                         <div className="pt-2">
                            <Button 
                                type="submit" 
                                isLoading={loading}
                                className="w-full"
                                icon={<Send className="w-4 h-4" />}
                            >
                                Send Message
                            </Button>
                         </div>
                     </form>
                 </Card>
             )}
             
             <div className="text-center mt-8">
                <p className="text-xs text-gray-400">
                    Direct Email: <a href="mailto:support@kosma.io" className="text-brand-500 font-bold hover:underline">support@kosma.io</a>
                </p>
             </div>
         </div>
      </div>
    </MarketingLayout>
  );
};