import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { useAdminData, useIsAdmin } from "@/hooks/useAdminFunctionality";
import AdminView from "./AdminView";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const AdminViewWrapper = () => {
  const { user } = useAuth();
  const admin = useIsAdmin();

  const [usersPage, setUsersPage] = useState(1);
  const [usersCursorHistory, setUsersCursorHistory] = useState<number[]>([0]);
  const usersCursor = usersCursorHistory[usersPage - 1];

  const [servicesPage, setServicesPage] = useState(1);
  const [servicesCursorHistory, setServicesCursorHistory] = useState<number[]>([0]);
  const servicesCursor = servicesCursorHistory[servicesPage - 1];

  const [pendingServicesPage, setPendingServicesPage] = useState(1);
  const [pendingServicesCursorHistory, setPendingServicesCursorHistory] = useState<number[]>([0]);
  const pendingServicesCursor = pendingServicesCursorHistory[pendingServicesPage - 1];

  const [couponsPage, setCouponsPage] = useState(1);
  const [couponsHistory, setCouponsCursorHistory] = useState<number[]>([0]);
  const couponsCursor = couponsHistory[couponsPage - 1];

  const adminData = useAdminData({
    usersCursor,
    servicesCursor,
    pendingServicesCursor,
    couponsCursor,
  });
  const {
    analyticsSummary,
    loginStats,
    dailyStats,
    monthlyStats,
    yearlyStats,
  } = useAdminAnalytics();

  if (!user || !admin) return <Navigate to="/" />;
  return (
    <AdminView
      adminData={adminData}

      usersPage={usersPage}
      setUsersPage={setUsersPage}
      setUsersCursorHistory={setUsersCursorHistory}

      servicesPage={servicesPage}
      setServicesPage={setServicesPage}
      setServicesCursorHistory={setServicesCursorHistory}

      pendingServicesPage={pendingServicesPage}
      setPendingServicesPage={setPendingServicesPage}
      setPendingServicesCursorHistory={setPendingServicesCursorHistory}

      couponsPage={couponsPage}
      setCouponsPage={setCouponsPage}
      setCouponsCursorHistory={setCouponsCursorHistory}

      stats={adminData.stats}
      analyticsSummary={analyticsSummary}
      loginStats={loginStats}
      dailyStats={dailyStats}
      monthlyStats={monthlyStats}
      yearlyStats={yearlyStats}
    />
  );
};

export default AdminViewWrapper;
