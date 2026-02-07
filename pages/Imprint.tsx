import React from 'react';
import { MarketingLayout } from '../components/layout/MarketingLayout';

export const ImprintPage: React.FC = () => {
  return (
    <MarketingLayout>
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">Imprint</h1>
        <p className="text-lg text-brand-500 font-bold mb-8">Legal Information</p>
        
        <div className="text-gray-600 leading-relaxed space-y-8">
          
          {/* Company Information */}
          <section>
             <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Company Information</h3>
             <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Company Name</h4>
                   <p className="font-bold text-gray-900 text-base">Headstart Media GmbH</p>
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Legal Form</h4>
                   <p className="font-medium text-gray-900 text-sm">Limited liability company (GmbH)</p>
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Registered Address</h4>
                   <p className="font-medium text-gray-900 leading-relaxed text-sm">
                     Birmensdorferstrasse 5<br/>
                     8004 Zurich<br/>
                     Switzerland
                   </p>
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Country of Registration</h4>
                   <p className="font-medium text-gray-900 text-sm">Switzerland (CH)</p>
                </div>
             </div>
          </section>

          {/* Contact */}
          <section>
             <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Contact</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email (Support & Billing)</h4>
                   <a href="mailto:info@kosma.io" className="text-base font-bold text-brand-500 hover:underline">info@kosma.io</a>
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Website</h4>
                   <a href="https://www.kosma.io" target="_blank" rel="noreferrer" className="text-base font-bold text-brand-500 hover:underline">https://www.kosma.io</a>
                </div>
             </div>
          </section>

          {/* Tax Information */}
          <section>
             <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Tax Information</h3>
             <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">VAT / UID Number (Switzerland)</h4>
                        <p className="font-bold text-gray-900 font-mono text-sm">CHE-408.111.533</p>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">VAT Status</h4>
                        <p className="font-medium text-gray-900 text-sm">VAT registered in Switzerland</p>
                    </div>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                   <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">EU VAT Information</h4>
                   <p className="font-bold text-blue-900 text-sm">0 % VAT (reverse charge applies for EU customers, non-EU supplier)</p>
                </div>
             </div>
          </section>

          {/* Dispute Resolution */}
          <section>
             <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">EU Online Dispute Resolution (ODR)</h3>
             <p className="mb-2 text-sm">
                The European Commission provides a platform for online dispute resolution (ODR):<br/>
                <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer" className="text-brand-500 font-bold hover:underline">https://ec.europa.eu/consumers/odr</a>
             </p>
             <p className="text-xs text-gray-500 italic">
                Headstart Media GmbH is not obliged and does not participate in dispute resolution proceedings before a consumer arbitration board.
             </p>
          </section>

          {/* Applicable Law */}
          <section>
             <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Applicable Law</h3>
             <p className="font-medium text-gray-900 text-sm">This Imprint is governed by the laws of Switzerland.</p>
          </section>

        </div>
      </div>
    </MarketingLayout>
  );
};