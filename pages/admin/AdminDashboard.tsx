import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardOverview } from './DashboardOverview';
import { UsersManagement } from './UsersManagement';
import { MarketingView } from './MarketingView';
import { SystemHealthView } from './SystemHealthView';
import { DebugView } from './DebugView';

export const AdminDashboard: React.FC = () => {
    // Debug log to verify component mount
    useEffect(() => { console.log("[AdminDashboard] Mounting..."); }, []);

    return (
        <div className="pb-20">
            <Routes>
                <Route index element={<DashboardOverview />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="marketing" element={<MarketingView />} />
                <Route path="system" element={<SystemHealthView />} />
                <Route path="debug" element={<DebugView />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
        </div>
    );
};