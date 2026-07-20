import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import { useAdminData, useIsAdmin } from '@/hooks/useAdminFunctionality';
import AdminView from './AdminView';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const AdminViewWrapper = () => {
    const { user } = useAuth();
    const admin = useIsAdmin();
    const [usersCursor, setUsersCursor] = useState(0);
    const [servicesCursor, setServicesCursor] = useState(null);
    const [pendingServicesCursor, setPendingServicesCursor] = useState(null);
    const [couponsCursor, setCouponsCursor] = useState(null);

    const adminData = useAdminData({
      usersCursor,
      servicesCursor,
      pendingServicesCursor,
      couponsCursor
    });
    const { analyticsSummary, loginStats, dailyStats, monthlyStats, yearlyStats } = useAdminAnalytics();

    if (!user || !admin) return <Navigate to="/" />
  return (
    <AdminView 
      adminData={adminData}
      stats={adminData.stats}
      analyticsSummary={analyticsSummary}
      loginStats={loginStats}
      dailyStats={dailyStats}
      monthlyStats={monthlyStats}
      yearlyStats={yearlyStats}
    />
  )
}

export default AdminViewWrapper