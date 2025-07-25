
import { useState } from 'react';
import { useCoupon } from './useCoupon';

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
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    phoneNumber: '',
    accountNumber: ''
  });

  const couponState = useCoupon();

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  return {
    paymentMethod,
    setPaymentMethod,
    paymentData,
    handleInputChange,
    ...couponState
  };
};
