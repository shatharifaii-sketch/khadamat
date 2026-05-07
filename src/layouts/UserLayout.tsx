import Navigation from "@/components/Navigation";
import { useWebsiteAnalytics } from "@/hooks/useWebsiteAnalytics";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
  useWebsiteAnalytics();
  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      <Outlet />
    </div>
  )
}

export default UserLayout