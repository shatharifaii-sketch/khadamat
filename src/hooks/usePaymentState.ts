
import { useState } from 'react';
import { AppliedCoupon } from '@/components/Payment/CouponInput';

export interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  phoneNumber: string;
  accountNumber: string;
}

export const usePaymentState = () => {
  const [paymentMethod, setPaymentMethod] = useState('reflect');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    phoneNumber: '',
    accountNumber: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  return {
    paymentMethod,
    setPaymentMethod,
    appliedCoupon,
    setAppliedCoupon,
    paymentData,
    handleInputChange
  };
};
