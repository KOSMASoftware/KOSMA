import React, { useState } from 'react';
import { MarketingLayout } from '../components/layout/MarketingLayout';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { FormField } from '../components/ui/FormField';

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
      <div className="min-h-[calc(100vh-72px)] py-16 px-6">
         <div className="max-w-2xl mx-auto">
             <div className="text-center mb-10">
                 <div className="w-12 h-12 bg-brand-50 text-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                     <Mail className="w-6 h-6" />
                 </div>
                 <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-6">Contact Support</h1>
                 <p className="text-base md:text-lg text-gray-500">
                    We're here to help. Send us a message and we'll respond as soon as possible.
                 </p>
             </div>

             {success ? (
                 <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center animate-in fade-in zoom-in-95">
                     <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                     <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                     <p className="text-gray-600 mb-8">Thank you for contacting us. We will get back to you shortly.</p>
                     <Button variant="ghost" onClick={() => { setSuccess(false); setFormData({name:'', email:'', message:''}); }}>
                        Send another message
                     </Button>
                 </div>
             ) : (
                 <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                     <FormField label="Name">
                         <Input 
                            required
                            type="text" 
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                         />
                     </FormField>
                     <FormField label="Email Address">
                         <Input 
                            required
                            type="email" 
                            placeholder="hello@example.com"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                         />
                     </FormField>
                     <FormField label="Message">
                         <TextArea 
                            required
                            rows={6}
                            placeholder="How can we help you?"
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
                        Alternatively, you can email us directly at <a href="mailto:support@kosma.io" className="text-brand-500 font-bold hover:underline">support@kosma.io</a>
                     </p>
                 </form>
             )}
         </div>
      </div>
    </MarketingLayout>
  );
};