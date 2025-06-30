
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { usePaymentHistory } from '@/hooks/usePaymentHistory';
import { Loader2 } from 'lucide-react';

const SubscriptionHistoryTable = () => {
  const { paymentHistory, isLoading } = usePaymentHistory();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">مكتملة</Badge>;
      case 'pending':
        return <Badge variant="secondary">قيد المراجعة</Badge>;
      case 'failed':
        return <Badge variant="destructive">فاشلة</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'credit_card': return 'بطاقة ائتمان';
      case 'reflect': return 'ريفلكت';
      case 'jawwal_pay': return 'جوال باي';
      case 'ooredoo': return 'أوريدو';
      case 'bank_transfer': return 'تحويل بنكي';
      default: return method;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>تاريخ الاشتراكات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>تاريخ الاشتراكات</CardTitle>
      </CardHeader>
      <CardContent>
        {paymentHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا يوجد تاريخ دفع
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">طريقة الدفع</TableHead>
                <TableHead className="text-right">عدد الخدمات</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {new Date(payment.created_at).toLocaleDateString('ar')}
                  </TableCell>
                  <TableCell>
                    {payment.amount} {payment.currency}
                  </TableCell>
                  <TableCell>
                    {getPaymentMethodText(payment.payment_method)}
                  </TableCell>
                  <TableCell>
                    {payment.services_quota} خدمة
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(payment.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionHistoryTable;
