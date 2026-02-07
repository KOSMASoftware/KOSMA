import React from 'react';
import { MarketingLayout } from '../components/layout/MarketingLayout';

export const TermsPage: React.FC = () => {
  return (
    <MarketingLayout>
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">General Terms and Conditions (GTC)</h1>
        <p className="text-lg text-brand-500 font-bold mb-8">KOSMA Software</p>
        
        <div className="text-gray-600 leading-relaxed space-y-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Last updated: 14 January 2026</p>
            <p className="font-medium text-base text-gray-900">
              These General Terms and Conditions (“Terms”) govern the use of the KOSMA Application, Client Software and related cloud services and storage (collectively, the “Service”) provided by Headstart Media GmbH, Birmensdorferstrasse 5, 8004 Zurich, Switzerland (“Headstart Media”, “Provider”).
            </p>
          </div>
          
          <p className="text-sm">
            By downloading, installing, accessing or using the Service, you (“Customer” or “you”) agree to be bound by these Terms.<br/>
            <strong>If you do not agree, you must immediately cease any use of the Service.</strong>
          </p>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-sm">
            <p className="font-bold mb-2">You represent and warrant that:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li>(a) you have full legal capacity to enter into this agreement;</li>
                <li>(b) you have read, understood and accepted these Terms; and</li>
                <li>(c) you have not previously violated any terms or agreements with Headstart Media.</li>
            </ul>
          </div>

          <div className="space-y-8 pt-2">
            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">1. Description of the Service</h3>
                <p className="mb-2 text-sm">KOSMA is a client/server-based software solution for financial planning, budgeting and financing management.</p>
                <p className="mb-2 text-sm">The Service consists of:</p>
                <ul className="list-disc pl-5 space-y-1 marker:text-brand-500 mb-2 text-sm">
                    <li>locally installable client software (“Client Software”),</li>
                    <li>the KOSMA website (“Website”), and</li>
                    <li>the KOSMA server infrastructure and cloud storage (“Network”).</li>
                </ul>
                <p className="text-sm">The Service enables Customers to create projects, store and process files, synchronize data, and share data with selected other users via the Network. The Client Software and Website may differ in features and appearance depending on the operating system, device, license type and Service version.</p>
            </section>

            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">2. Data Storage, Encryption and Responsibility</h3>
                <p className="mb-2 text-sm">All data stored via the Service, including metadata (file names, descriptions, comments, thumbnails, etc.) (“Data”), is encrypted in such a way that it cannot be read by Headstart Media or third parties, unless explicitly shared or made public by the Customer.</p>
                <p className="mb-2 font-bold text-sm">Headstart Media:</p>
                <ul className="list-disc pl-5 space-y-1 marker:text-brand-500 mb-4 text-sm">
                    <li>has no access to Customer passwords,</li>
                    <li>does not store passwords, and</li>
                    <li>cannot recover lost passwords.</li>
                </ul>
                <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm font-medium border border-amber-100">
                    The Customer acknowledges that loss of credentials will result in irreversible loss of access to stored Data.
                    The Customer is solely responsible for maintaining independent backups of all Data.
                </div>
            </section>
            
            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">3. Customer Obligations</h3>
                <p className="mb-2 font-bold text-sm">The Customer shall:</p>
                <ul className="list-disc pl-5 space-y-1 marker:text-brand-500 mb-4 text-sm">
                    <li>use the Service in compliance with all applicable laws and regulations,</li>
                    <li>ensure the accuracy of all account information,</li>
                    <li>maintain the confidentiality of login credentials,</li>
                    <li>be fully responsible for all activities under the Customer’s account, whether authorized or unauthorized.</li>
                </ul>
                <p className="mb-2 font-bold text-sm">The Customer shall not:</p>
                <ul className="list-disc pl-5 space-y-1 marker:text-brand-500 mb-4 text-sm">
                    <li>access the Service using unauthorized software,</li>
                    <li>interfere with or disrupt the Service or Network,</li>
                    <li>use the Service in ways not intended or permitted,</li>
                    <li>modify, delete or access Data without authorization.</li>
                </ul>
                <p className="text-sm">Headstart Media does not monitor stored or transmitted Data and assumes no responsibility for such Data.</p>
            </section>

            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">4. Updates and Changes to the Service</h3>
                <p className="mb-2 text-sm">The Customer is responsible for keeping the Client Software up to date. Updates may be installed automatically or may require manual installation.</p>
                <p className="mb-2 text-sm">Failure to install updates may result in reduced functionality or unavailability of the Service.</p>
                <p className="text-sm">Headstart Media may modify, extend, restrict or discontinue features of the Service at any time, provided that the essential nature of the Service is not fundamentally altered.</p>
            </section>

            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">5. License Grant and Intellectual Property</h3>
                <p className="mb-2 text-sm">Headstart Media grants the Customer a non-exclusive, non-transferable, non-sublicensable license to download, install and use the Client Software on a maximum of two (2) devices, unless otherwise agreed.</p>
                <p className="mb-2 text-sm">All intellectual property rights in the Client Software, Network, Website and related materials remain with Headstart Media or its licensors.</p>
                <p className="mb-2 text-sm">The Customer may not:</p>
                <ul className="list-disc pl-5 space-y-1 marker:text-brand-500 mb-4 text-sm">
                    <li>reverse engineer, decompile or disassemble the Software,</li>
                    <li>create derivative works,</li>
                    <li>remove proprietary notices,</li>
                    <li>sublicense, sell or assign the Software or Service.</li>
                </ul>
                <p className="text-sm">Outputs generated by the Service (e.g. budgets, diagrams, reports) may be used by the Customer, provided no third-party rights are infringed.</p>
            </section>

            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">6. Storage Capacity and Third-Party Services</h3>
                <p className="mb-2 text-sm">Headstart Media may provide a defined amount of cloud storage (300 MB). Additional storage may be offered separately. Storage capacity is independent of the license and subject to change.</p>
                <p className="mb-2 text-sm">Cloud storage services may be provided through third-party providers. By using the storage functionality, the Customer agrees to the applicable third-party terms, including those of the infrastructure provider (e.g. time4vps.eu).</p>
                <p className="text-sm">Exceeding storage limits may result in suspension or termination of the Service.</p>
            </section>

            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">7. Trial Versions and Support</h3>
                <p className="mb-2 text-sm">Trial versions may be provided free of charge for a limited period (e.g. 14 days). Trial versions are provided “as is”, without warranty, availability guarantees or support, and must not be used for production or mission-critical purposes.</p>
                <p className="text-sm">Support services may be offered at the sole discretion of Headstart Media and are not included unless explicitly agreed. Headstart Media may suspend or terminate support services at any time.</p>
            </section>

            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">8. Term, Termination and Account Deletion</h3>
                <p className="mb-2 text-sm">The Customer may terminate the Service at any time by written notice.</p>
                <p className="mb-2 text-sm">Headstart Media may terminate the Customer’s account, with reasonable notice, if:</p>
                <ul className="list-disc pl-5 space-y-1 marker:text-brand-500 mb-4 text-sm">
                    <li>the account has been inactive for an extended period,</li>
                    <li>storage limits are exceeded,</li>
                    <li>the Service is discontinued,</li>
                    <li>the Customer breaches these Terms.</li>
                </ul>
                <p className="mb-2 font-bold text-sm">Upon termination:</p>
                <ul className="list-disc pl-5 space-y-1 marker:text-brand-500 mb-4 text-sm">
                    <li>all use of the Service must cease,</li>
                    <li>all Client Software must be deleted,</li>
                    <li>Headstart Media may permanently delete all stored Data.</li>
                </ul>
                <p className="text-sm">The Customer is solely responsible for exporting Data prior to termination.</p>
            </section>

            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">9. Prices, Payments and Refunds</h3>
                <p className="mb-2 text-sm">Published prices are binding and inclusive of VAT unless stated otherwise.</p>
                <p className="mb-2 text-sm">Support and onboarding are not included unless agreed.</p>
                <p className="mb-2 text-sm">Commercial customers have no right of withdrawal.</p>
                <p className="text-sm">Private consumers may withdraw within 14 days, where legally required.</p>
            </section>

            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">10. Disclaimer of Warranty</h3>
                <p className="mb-2 text-sm">The Service is provided “as is” and “with all faults”.</p>
                <p className="mb-2 text-sm">Headstart Media makes no warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, accuracy, completeness or reliability.</p>
                <p className="text-sm">The Customer acknowledges the inherent risks of electronic data storage and processing.</p>
            </section>

             <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">11. Limitation of Liability</h3>
                <p className="mb-2 text-sm">To the maximum extent permitted by law:</p>
                <ul className="list-disc pl-5 space-y-1 marker:text-brand-500 mb-4 text-sm">
                    <li>Headstart Media is liable only for intent or gross negligence.</li>
                    <li>Liability for slight negligence is excluded.</li>
                    <li>Mandatory liability for injury to life, body or health remains unaffected.</li>
                </ul>
                <p className="mb-2 font-bold text-sm">Headstart Media shall not be liable for:</p>
                <ul className="list-disc pl-5 space-y-1 marker:text-brand-500 mb-4 text-sm">
                    <li>financial losses or lost profits,</li>
                    <li>incorrect calculations or outputs,</li>
                    <li>rejected funding or financing decisions,</li>
                    <li>loss, corruption or deletion of Data.</li>
                </ul>
                <p className="text-sm">Total liability is limited to the fees paid by the Customer during the preceding 12 months.</p>
            </section>

            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">12. Indemnification</h3>
                <p className="text-sm">The Customer shall indemnify and hold harmless Headstart Media from all claims arising out of:</p>
                <ul className="list-disc pl-5 space-y-1 marker:text-brand-500 text-sm">
                    <li>misuse of the Service,</li>
                    <li>violation of these Terms,</li>
                    <li>infringement of third-party rights through Customer Data.</li>
                </ul>
            </section>

            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">13. Privacy and Legal Compliance</h3>
                <p className="mb-2 text-sm">Data processing is governed by the applicable Privacy Policy, which forms an integral part of these Terms.</p>
                <p className="text-sm">Headstart Media may disclose Data where required by law, court order or competent authority, or to protect legal rights or public safety.</p>
            </section>

            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">14. Amendments</h3>
                <p className="mb-2 text-sm">Headstart Media may amend these Terms.</p>
                <p className="mb-2 text-sm">Amendments become effective upon notification via email or within the Service.</p>
                <p className="text-sm">If the Customer objects within ten (10) days, Headstart Media may either:</p>
                <ul className="list-disc pl-5 space-y-1 marker:text-brand-500 text-sm">
                    <li>(a) terminate the Service with a pro rata refund, or</li>
                    <li>(b) continue under the previous Terms until renewal.</li>
                </ul>
            </section>

            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">15. Governing Law and Jurisdiction</h3>
                <p className="mb-2 text-sm">These Terms are governed by Swiss law, excluding the CISG.</p>
                <p className="text-sm">Exclusive place of jurisdiction is Zurich, Switzerland.</p>
            </section>

            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">16. Final Provisions</h3>
                <p className="mb-2 text-sm">If any provision is held invalid, the remaining provisions remain effective.</p>
                <p className="text-sm">The English version of these Terms shall prevail.</p>
            </section>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
};