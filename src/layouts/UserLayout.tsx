import AiChat from "@/components/AiChat";
import Navigation from "@/components/Navigation";
import useWebAnalytics from "@/hooks/useWebAnalytics";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
  //useWebsiteAnalytics();
  useWebAnalytics();
  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      <Outlet />
      {/* <AiChat /> */}
    </div>
  )
}

export default UserLayout