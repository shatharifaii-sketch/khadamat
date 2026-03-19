import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import { useAdminData, useIsAdmin } from '@/hooks/useAdminFunctionality';
import AdminView from './AdminView';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AdminViewWrapper = () => {
    const { user } = useAuth();
    const admin = useIsAdmin();

    const { adminData } = useAdminData();
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