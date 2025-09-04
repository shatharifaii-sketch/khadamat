
import { useState, useEffect, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  MessageSquare, 
  Settings, 
  Mail,
  CheckCircle,
  Activity,
  BarChart3,
  Edit,
  XCircle,
  Shield,
  Search,
  TrendingUp
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import { ServiceEditModal } from '@/components/Admin/ServiceEditModal';
import { UserManagement } from '@/components/Admin/UserManagement';
import { ServiceManagement } from '@/components/Admin/ServiceManagement';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import ActivityChart from '@/components/Admin/ActivityChart';
import { isAdmin, Service, useAdminData, useAdminFunctionality } from '@/hooks/useAdminFunctionality';
import ErrorBoundary from '@/components/ErrorBoundary';
import AdminViewWrapper from '@/components/Admin/AdminViewWrapper';
import AdminLoading from '@/components/Admin/AdminLoading';

const Admin = () => {
return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            لوحة التحكم الإدارية
          </h1>
          <p className="text-muted-foreground text-lg">
            إدارة شاملة للمنصة ومراقبة الأداء
          </p>
        </div>

        <Suspense fallback={<AdminLoading />}>
          <ErrorBoundary fallback={<div>Something went wrong</div>}>
            <AdminViewWrapper />
          </ErrorBoundary>
        </Suspense>
      </div>
  );
};

export default Admin;
