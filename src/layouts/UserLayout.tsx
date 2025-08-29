import Navigation from "@/components/Navigation";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      <Outlet />
    </div>
  )
}

export default UserLayout