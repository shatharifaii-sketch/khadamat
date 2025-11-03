import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import { useAdminData } from '@/hooks/useAdminFunctionality';
import React from 'react'
import AdminView from './AdminView';

const AdminViewWrapper = () => {
    const { adminData } = useAdminData();
    const { analyticsSummary, loginStats, dailyStats, monthlyStats, yearlyStats } = useAdminAnalytics();
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