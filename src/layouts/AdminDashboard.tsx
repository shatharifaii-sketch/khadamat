import Navigation from '@/components/Navigation'
import { Outlet } from 'react-router-dom'

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      <Outlet />
    </div>
  )
}

export default AdminDashboard