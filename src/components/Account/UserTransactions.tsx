import { useSubscriptionsPayment } from '@/hooks/useSubscriptionsPayment';
import React from 'react'
import { Card, CardContent, CardHeader } from '../ui/card';
import { Table, TableHead, TableHeader, TableRow } from '../ui/table';

function UserTransactions() {
    const { paymentTransactions } = useSubscriptionsPayment();

    return (
        <Card>
            <CardHeader className='text-2xl'>
                الدفعات السابقة
            </CardHeader>
            <CardContent>
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
                </Table>
            </CardContent>
        </Card>
    )
}

export default UserTransactions