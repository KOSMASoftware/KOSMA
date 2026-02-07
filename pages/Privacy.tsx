import React from 'react';
import { MarketingLayout } from '../components/layout/MarketingLayout';
import { useCookieSettings } from '../context/CookieContext';

export const PrivacyPage: React.FC = () => {
  const { openModal } = useCookieSettings();

  return (
    <MarketingLayout>
      <div className="max-w-4xl mx-auto px-6 py-20 md:py-32">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-xl text-brand-500 font-bold mb-12">KOSMA Software</p>
        
        <div className="text-gray-600 leading-relaxed space-y-8">
            <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Last updated: 14 January 2026</p>
                <p className="font-medium text-lg text-gray-900">
                    This Privacy Policy describes how Headstart Media GmbH, Birmensdorferstrasse 5, 8004 Zurich, Switzerland (“Headstart Media”, “we”, “us”), processes personal data in connection with the use of the KOSMA Application, Client Software, Website and related cloud services (collectively, the “Service”).
                </p>
            </div>
            
            <p>
                This Privacy Policy applies in accordance with the Swiss Federal Act on Data Protection (FADP) and, where applicable, the EU General Data Protection Regulation (GDPR).<br/>
                By using the Service, you (“User” or “Customer”) acknowledge and accept this Privacy Policy.
            </p>

            <div className="space-y-10 pt-4">
                <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">1. Controller</h3>
                    <p className="mb-2">The controller responsible for data processing is:</p>
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-sm">
                        <p className="font-bold">Headstart Media GmbH</p>
                        <p>Birmensdorferstrasse 5</p>
                        <p>8004 Zurich</p>
                        <p>Switzerland</p>
                        <p className="mt-2">Email: <a href="mailto:info@kosma.io" className="text-brand-500 hover:underline">info@kosma.io</a></p>
                        <p>Website: <a href="https://www.kosma.io" target="_blank" rel="noreferrer" className="text-brand-500 hover:underline">www.kosma.io</a></p>
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">2. Categories of Personal Data</h3>
                    <p className="mb-4">Headstart Media may process the following categories of personal data:</p>
                    
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1">a) Account and Identification Data</h4>
                            <ul className="list-disc pl-5 space-y-1 marker:text-brand-500">
                                <li>Name</li>
                                <li>Email address</li>
                                <li>Company name</li>
                                <li>Billing and license information</li>
                                <li>Language and region settings</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1">b) Usage and Technical Data</h4>
                            <ul className="list-disc pl-5 space-y-1 marker:text-brand-500">
                                <li>IP address</li>
                                <li>Device and operating system information</li>
                                <li>Application version</li>
                                <li>Log files and timestamps</li>
                                <li>Error and crash reports</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1">c) Customer Content and Project Data</h4>
                            <ul className="list-disc pl-5 space-y-1 marker:text-brand-500">
                                <li>Files, documents and project data uploaded or created by the User</li>
                                <li>Metadata (file names, comments, thumbnails)</li>
                            </ul>
                            <p className="mt-2 text-sm bg-amber-50 text-amber-800 p-3 rounded-lg border border-amber-100">
                                Customer Content is encrypted and not readable by Headstart Media unless explicitly shared by the User.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">3. Purpose of Data Processing</h3>
                    <p className="mb-2">Personal data is processed for the following purposes:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-brand-500">
                        <li>Provision and operation of the Service</li>
                        <li>User authentication and account management</li>
                        <li>License management and billing</li>
                        <li>Synchronization, storage and sharing of data</li>
                        <li>Customer communication and legally required notifications</li>
                        <li>Security, abuse prevention and system integrity</li>
                        <li>Compliance with legal obligations</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">4. Encryption and Data Access</h3>
                    <p className="mb-2">All Customer Content stored in the cloud is encrypted in such a way that:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-brand-500 mb-4">
                        <li>Headstart Media has no access to the content</li>
                        <li>Passwords are not stored and cannot be recovered</li>
                        <li>Loss of credentials results in irreversible loss of access to encrypted data</li>
                    </ul>
                    <p className="font-bold">Users are solely responsible for maintaining backups of their data.</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">5. Legal Basis for Processing</h3>
                    <p className="mb-2">Data processing is based on:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-brand-500">
                        <li>Performance of a contract (Art. 31 FADP / Art. 6(1)(b) GDPR)</li>
                        <li>Compliance with legal obligations (Art. 31 FADP / Art. 6(1)(c) GDPR)</li>
                        <li>Legitimate interests of Headstart Media (Art. 31 FADP / Art. 6(1)(f) GDPR)</li>
                        <li>User consent, where required (Art. 31 FADP / Art. 6(1)(a) GDPR)</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">6. Data Storage and Third-Party Providers</h3>
                    <p className="mb-2">Personal data and encrypted content may be processed and stored on servers operated by third-party infrastructure providers.</p>
                    <p className="mb-2">Such providers act as data processors and are contractually bound to comply with applicable data protection laws and appropriate security measures.</p>
                    <p>Cloud infrastructure providers may include providers located within Switzerland or the European Economic Area.</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">7. Disclosure of Data</h3>
                    <p className="mb-2">Personal data may be disclosed only:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-brand-500 mb-4">
                        <li>if required by law, court order or competent authority</li>
                        <li>to protect the rights, property or safety of Headstart Media, Users or the public</li>
                        <li>to service providers acting on behalf of Headstart Media</li>
                        <li>with the explicit consent of the User</li>
                    </ul>
                    <p>Customer Content is never disclosed unless explicitly shared by the User or legally required.</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">8. Data Retention</h3>
                    <p className="mb-2">Personal data is retained only as long as necessary for:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-brand-500 mb-4">
                        <li>performance of the contract</li>
                        <li>compliance with legal retention obligations</li>
                        <li>enforcement or defense of legal claims</li>
                    </ul>
                    <p>Upon termination of the account, stored data may be permanently deleted after a reasonable period.</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">9. User Rights</h3>
                    <p className="mb-2">Users have the right to:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-brand-500 mb-4">
                        <li>access their personal data</li>
                        <li>request correction of inaccurate data</li>
                        <li>request deletion of personal data, where legally permissible</li>
                        <li>restrict or object to processing</li>
                        <li>receive data portability, where applicable</li>
                        <li>withdraw consent at any time (without affecting prior processing)</li>
                    </ul>
                    <p>Requests can be submitted to <a href="mailto:info@kosma.io" className="text-brand-500 hover:underline">info@kosma.io</a>.</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">10. Cookies and Tracking</h3>
                    <p className="mb-2">We use cookies and similar technologies to ensure the operation of the Service and to improve it.</p>
                    <p className="mb-4">You can manage your cookie preferences at any time via the <button onClick={openModal} className="text-brand-500 font-bold hover:underline">“Cookie Settings”</button> link in the footer.</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">11. Data Security</h3>
                    <p className="mb-2">Headstart Media implements appropriate technical and organizational security measures, including:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-brand-500 mb-4">
                        <li>encryption of stored data</li>
                        <li>access controls</li>
                        <li>network security measures</li>
                        <li>regular security updates</li>
                    </ul>
                    <p>Despite these measures, no system can be completely secure. Users acknowledge residual risks.</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">12. International Data Transfers</h3>
                    <p>If personal data is transferred outside Switzerland or the EU/EEA, appropriate safeguards are applied, including standard contractual clauses or equivalent protections.</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">13. Changes to this Privacy Policy</h3>
                    <p className="mb-2">Headstart Media may amend this Privacy Policy.</p>
                    <p>Changes become effective upon publication on the Website or notification within the Service.</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">14. Governing Law</h3>
                    <p>This Privacy Policy is governed by Swiss law, excluding conflict-of-law rules.</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">15. Contact</h3>
                    <p className="mb-2">For questions regarding data protection or this Privacy Policy, please contact:</p>
                    <a href="mailto:info@kosma.io" className="text-brand-500 hover:underline font-bold">info@kosma.io</a>
                </section>

            </div>
        </div>
      </div>
    </MarketingLayout>
  );
};