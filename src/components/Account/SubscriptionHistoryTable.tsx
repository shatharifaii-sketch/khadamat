
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { usePaymentHistory, PaymentHistory } from '@/hooks/usePaymentHistory';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '../ui/button';

const SubscriptionHistoryTable = () => {
  const { paymentHistory, isLoading } = usePaymentHistory();
  const { getUserSubscription } = useSubscription();
  const { user } = useAuth();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">مفعل</Badge>;
      case 'inactive':
        return <Badge variant="secondary">متوقف</Badge>;
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
      case 'free_trial': return 'تجربة مجانية';
      default: return method;
    }
  };

  const getSubscriptionTierText = (tier: string) => {
    switch (tier) {
      case 'Yearly': return 'سنوي';
      case 'Monthly': return 'شهري';
      default: return tier || 'شهري';
    }
  };

  const formatAmount = (payment: PaymentHistory) => {
    if (payment.amount === 0) {
      return 'مجاني';
    }
    
    let displayText = `${payment.finalAmount || payment.amount} ${payment.currency}`;
    
    if (payment.hasDiscount && payment.discount_applied && payment.discount_applied > 0) {
      displayText += ` (خصم ${payment.discount_applied} من ${payment.original_amount})`;
    }
    
    return displayText;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>تاريخ الدفع</CardTitle>
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
        <CardTitle>تاريخ الدفع</CardTitle>
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
                <TableHead className="text-right">نوع الاشتراك</TableHead>
                <TableHead className="text-right">مدة الخدمة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.map((payment: PaymentHistory) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {new Date(payment.created_at).toLocaleDateString('ar')}
                  </TableCell>
                  <TableCell>
                    {formatAmount(payment)}
                  </TableCell>
                  <TableCell>
                    {payment.paymentMethodText || getPaymentMethodText(payment.payment_method)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getSubscriptionTierText(payment.subscription_tier)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {payment.actualDuration || (payment.subscription_tier === 'yearly' ? '12 شهر' : '1 شهر')}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(payment.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

          {paymentHistory.length === 0 && (
            <div className='w-full'>
              {/* Additional content can be added here if needed */}
              <Button variant='default' className='flex-1 w-full mt-6' disabled={!user}>
                اشترك الآن
              </Button>
            </div>
          )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionHistoryTable;
