
import React, { useState } from 'react';
import { MarketingLayout } from '../components/layout/MarketingLayout';
import { Mail, MessageSquare, Send, CheckCircle, Loader2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
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

  return (
    <MarketingLayout>
      <div className="min-h-[calc(100vh-72px)] py-20 px-6">
         <div className="max-w-2xl mx-auto">
             <div className="text-center mb-16">
                 <div className="w-16 h-16 bg-brand-50 text-brand-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
                     <Mail className="w-8 h-8" />
                 </div>
                 <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">Contact Support</h1>
                 <p className="text-xl text-gray-500">
                    We're here to help. Send us a message and we'll respond as soon as possible.
                 </p>
             </div>

             {success ? (
                 <div className="bg-green-50 border border-green-100 rounded-[2rem] p-12 text-center animate-in fade-in zoom-in-95">
                     <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                     <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                     <p className="text-gray-600 mb-8">Thank you for contacting us. We will get back to you shortly.</p>
                     <button onClick={() => { setSuccess(false); setFormData({name:'', email:'', message:''}); }} className="font-bold text-brand-500 hover:text-brand-700">Send another message</button>
                 </div>
             ) : (
                 <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm">
                     <div>
                         <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 pl-2">Name</label>
                         <input 
                            required
                            type="text" 
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full p-5 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-brand-500 bg-white text-gray-900 font-medium placeholder:text-gray-300 outline-none"
                         />
                     </div>
                     <div>
                         <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 pl-2">Email Address</label>
                         <input 
                            required
                            type="email" 
                            placeholder="hello@example.com"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className="w-full p-5 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-brand-500 bg-white text-gray-900 font-medium placeholder:text-gray-300 outline-none"
                         />
                     </div>
                     <div>
                         <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 pl-2">Message</label>
                         <textarea 
                            required
                            rows={6}
                            placeholder="How can we help you?"
                            value={formData.message}
                            onChange={e => setFormData({...formData, message: e.target.value})}
                            className="w-full p-5 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-brand-500 bg-white text-gray-900 font-medium placeholder:text-gray-300 outline-none resize-none"
                         />
                     </div>
                     
                     <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-brand-500 transition-all shadow-xl hover:shadow-brand-500/20 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            Send Message
                        </button>
                     </div>

                     <p className="text-center text-xs text-gray-400 mt-6">
                        Alternatively, you can email us directly at <a href="mailto:support@kosma.io" className="text-brand-500 font-bold hover:underline">support@kosma.io</a>
                     </p>
                 </form>
             )}
         </div>
      </div>
    </MarketingLayout>
  );
};
