
import ErrorBoundary from '@/components/ErrorBoundary';
import AdminViewWrapper from '@/components/Admin/AdminViewWrapper';
import AdminLoading from '@/components/Admin/AdminLoading';
import AdminDataQueryError from '@/components/ErrorViews/AdminDataQueryError';
import { Shield } from 'lucide-react';
import { Suspense } from 'react';

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
          <ErrorBoundary fallback={<AdminDataQueryError />}>
            <AdminViewWrapper />
          </ErrorBoundary>
        </Suspense>
      </div>
  );
};

export default Admin;
