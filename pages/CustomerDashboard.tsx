
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { License, SubscriptionStatus, Invoice, PlanTier, User, BillingAddress } from '../types';
import { Loader2, CreditCard, Settings, LayoutDashboard, Zap, LogOut } from 'lucide-react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';

const DashboardTabs = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex justify-center border-b border-gray-200 mb-8">
             <Link 
                to="/dashboard" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive('/dashboard') ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500'
                }`}
            >
                <LayoutDashboard className="w-4 h-4" /> Overview
            </Link>
            <Link 
                to="/dashboard/subscription" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive('/dashboard/subscription') ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500'
                }`}
            >
                <CreditCard className="w-4 h-4" /> Subscription
            </Link>
            <Link 
                to="/dashboard/settings" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive('/dashboard/settings') ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500'
                }`}
            >
                <Settings className="w-4 h-4" /> Settings
            </Link>
        </div>
    );
};

export const CustomerDashboard: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [licenses, setLicenses] = useState<License[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            // Fix: Explicitly mapping Supabase snake_case fields to camelCase License interface
            const { data, error } = await supabase.from('licenses').select('*').eq('user_id', user.id);
            if (error) {
                console.error("Error fetching licenses:", error);
                setLoading(false);
                return;
            }
            if (data) {
                const mappedLicenses: License[] = data.map((l: any) => ({
                    id: l.id,
                    userId: l.user_id,
                    productName: l.product_name,
                    planTier: l.plan_tier as PlanTier,
                    billingCycle: l.billing_cycle || 'none',
                    status: l.status as SubscriptionStatus,
                    validUntil: l.admin_valid_until_override || l.current_period_end || l.valid_until,
                    licenseKey: l.license_key,
                    billingProjectName: l.billing_project_name,
                    stripeSubscriptionId: l.stripe_subscription_id,
                    stripeCustomerId: l.stripe_customer_id,
                    cancelAtPeriodEnd: l.cancel_at_period_end,
                    canceledAt: l.canceled_at,
                    currentPeriodEnd: l.current_period_end,
                    adminValidUntilOverride: l.admin_valid_until_override,
                    adminOverrideReason: l.admin_override_reason,
                }));
                setLicenses(mappedLicenses);
            }
            setLoading(false);
        };
        fetchData();
    }, [user]);

    if (!user) return <Navigate to="/login" />;
    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-2">Welcome, {user.name}</h1>
            <p className="text-gray-500 text-center mb-10">Manage your KOSMA account and licenses.</p>
            <DashboardTabs />
            <Routes>
                <Route index element={<div className="bg-white p-6 rounded-xl border shadow-sm text-center">
                    <Zap className="w-12 h-12 text-brand-500 mx-auto mb-4" />
                    {/* Fix: Using planTier instead of non-existent plan_tier property */}
                    <h3 className="text-xl font-bold">Active Plan: {licenses[0]?.planTier || 'Free'}</h3>
                    <p className="text-gray-500 mt-2">Everything is up to date.</p>
                </div>} />
                <Route path="subscription" element={<div className="text-center text-gray-400">Subscription details</div>} />
                <Route path="settings" element={<div className="text-center text-gray-400">Account settings</div>} />
            </Routes>
        </div>
    );
};