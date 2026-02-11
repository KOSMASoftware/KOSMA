
import React from 'react';
import { MarketingLayout } from '../components/layout/MarketingLayout';
import { H1, H3, H5, Paragraph } from '../components/ui/Typography';

export const ImprintPage: React.FC = () => {
  return (
    <MarketingLayout>
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <H1 className="mb-2">Imprint</H1>
        <Paragraph className="text-lg text-brand-500 font-bold mb-8">Legal Information</Paragraph>
        
        <div className="leading-relaxed space-y-8">
          
          {/* Company Information */}
          <section>
             <H3 className="text-lg mb-4 border-b border-gray-100 pb-2">Company Information</H3>
             <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <H5 className="mb-1">Company Name</H5>
                   <Paragraph className="font-bold text-gray-900 text-base">Headstart Media GmbH</Paragraph>
                </div>
                <div>
                   <H5 className="mb-1">Legal Form</H5>
                   <Paragraph className="font-medium text-gray-900 text-sm">Limited liability company (GmbH)</Paragraph>
                </div>
                <div>
                   <H5 className="mb-1">Registered Address</H5>
                   <Paragraph className="font-medium text-gray-900 leading-relaxed text-sm">
                     Birmensdorferstrasse 5<br/>
                     8004 Zurich<br/>
                     Switzerland
                   </Paragraph>
                </div>
                <div>
                   <H5 className="mb-1">Country of Registration</H5>
                   <Paragraph className="font-medium text-gray-900 text-sm">Switzerland (CH)</Paragraph>
                </div>
             </div>
          </section>

          {/* Contact */}
          <section>
             <H3 className="text-lg mb-4 border-b border-gray-100 pb-2">Contact</H3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <H5 className="mb-1">Email (Support & Billing)</H5>
                   <a href="mailto:info@kosma.io" className="text-base font-bold text-brand-500 hover:underline">info@kosma.io</a>
                </div>
                <div>
                   <H5 className="mb-1">Website</H5>
                   <a href="https://www.kosma.io" target="_blank" rel="noreferrer" className="text-base font-bold text-brand-500 hover:underline">https://www.kosma.io</a>
                </div>
             </div>
          </section>

          {/* Tax Information */}
          <section>
             <H3 className="text-lg mb-4 border-b border-gray-100 pb-2">Tax Information</H3>
             <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <H5 className="mb-1">VAT / UID Number (Switzerland)</H5>
                        <Paragraph className="font-bold text-gray-900 font-mono text-sm">CHE-408.111.533</Paragraph>
                    </div>
                    <div>
                        <H5 className="mb-1">VAT Status</H5>
                        <Paragraph className="font-medium text-gray-900 text-sm">VAT registered in Switzerland</Paragraph>
                    </div>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                   <H5 className="text-blue-400 mb-1">EU VAT Information</H5>
                   <Paragraph className="font-bold text-blue-900 text-sm">0 % VAT (reverse charge applies for EU customers, non-EU supplier)</Paragraph>
                </div>
             </div>
          </section>

          {/* Dispute Resolution */}
          <section>
             <H3 className="text-lg mb-4 border-b border-gray-100 pb-2">EU Online Dispute Resolution (ODR)</H3>
             <Paragraph className="mb-2 text-sm">
                The European Commission provides a platform for online dispute resolution (ODR):<br/>
                <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer" className="text-brand-500 font-bold hover:underline">https://ec.europa.eu/consumers/odr</a>
             </Paragraph>
             <Paragraph className="text-xs text-gray-500 italic">
                Headstart Media GmbH is not obliged and does not participate in dispute resolution proceedings before a consumer arbitration board.
             </Paragraph>
          </section>

          {/* Applicable Law */}
          <section>
             <H3 className="text-lg mb-4 border-b border-gray-100 pb-2">Applicable Law</H3>
             <Paragraph className="font-medium text-gray-900 text-sm">This Imprint is governed by the laws of Switzerland.</Paragraph>
          </section>

        </div>
      </div>
    </MarketingLayout>
  );
};
