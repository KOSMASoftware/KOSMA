
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useCustomerData } from '../hooks/useCustomerData';
import { OverviewView } from '../components/dashboard/OverviewView';
import { SubscriptionView } from '../components/dashboard/SubscriptionView';
import { SettingsView } from '../components/dashboard/SettingsView';
import { LearningRewardsView } from '../components/dashboard/LearningRewardsView';
import { H5 } from '../components/ui/Typography';

export const CustomerDashboard: React.FC = () => {
    const { user } = useAuth();
    // Non-null assertion is safe because this component is protected by <ProtectedRoute> which checks user
    const { loading, licenses, invoices, billingAddress, refresh } = useCustomerData(user!);

    if (!user) return <Navigate to="/login" />;
    if (loading) return <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
        <H5>Loading Dashboard</H5>
    </div>;

    return (
        <div className="pb-20">
            <Routes>
                <Route index element={<OverviewView user={user} licenses={licenses} invoices={invoices} />} />
                <Route path="subscription" element={<SubscriptionView user={user} licenses={licenses} invoices={invoices} refresh={refresh} />} />
                <Route path="learning" element={<LearningRewardsView />} />
                <Route path="settings" element={<SettingsView user={user} licenses={licenses} billingAddress={billingAddress} refresh={refresh} />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </div>
    );
};
