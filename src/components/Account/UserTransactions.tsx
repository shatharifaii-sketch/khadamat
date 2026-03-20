import { SubscriptionTransaction, useSubscriptionsPayment } from '@/hooks/useSubscriptionsPayment';
import React from 'react'
import { Card, CardContent, CardHeader } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Download } from 'lucide-react';

function UserTransactions() {
    const { paymentTransactions } = useSubscriptionsPayment();

    console.log(paymentTransactions);

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
                            <TableHead className="text-right">نوع الاشتراك</TableHead>
                            <TableHead className="text-right">الحالة</TableHead>
                            <TableHead className='text-right'>
                                الفاتورة
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paymentTransactions.map((payment: SubscriptionTransaction) => (
                            <TableRow key={payment.id}>
                                <TableCell>
                                    {new Date(payment.payment_date).toLocaleDateString('ar')}
                                </TableCell>
                                <TableCell>
                                    {payment.amount}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {payment.subscription.tier.title}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {payment.payment_status}
                                </TableCell>
                                <TableCell>
                                    <a href={payment.invoice_url} className='flex gap-2 items-center border w-fit px-2 py-1 rounded-md border-black'>
                                        تحميل الفاتورة
                                        <Download />
                                    </a>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default UserTransactions