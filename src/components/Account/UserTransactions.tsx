import { SubscriptionTransaction, useSubscriptionsPayment } from '@/hooks/useSubscriptionsPayment';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function UserTransactions() {
    const { t } = useTranslation("account");
    const { paymentTransactions } = useSubscriptionsPayment();

    return (
        <Card>
            <CardHeader className='text-2xl'>
                {t("transactions.title")}
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">
                                {t("transactions.date")}
                            </TableHead>
                            <TableHead className="text-right">
                                {t("transactions.amount")}
                            </TableHead>
                            <TableHead className="text-right">
                                {t("transactions.subscription_type")}
                            </TableHead>
                            <TableHead className="text-right">
                                {t("transactions.status")}
                            </TableHead>
                            <TableHead className='text-right'>
                                {t("transactions.receipt")}
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
                                        {
                                            payment.billing_reason === 'extra_product_payment' ? t("transactions.extra_product_payment") : (payment.subscription?.tier?.title || '')
                                        }
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {payment.payment_status}
                                </TableCell>
                                <TableCell>
                                    <a href={payment.invoice_url} className='flex gap-2 items-center w-fit px-2 py-1 rounded-md bg-primary text-white hover:bg-primary/80 active:bg-primary/60'>
                                        {t("transactions.download_receipt")}
                                        <Download size={17} />
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