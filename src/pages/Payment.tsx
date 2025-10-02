import PaymentOrderSummary from '@/components/Payment/PaymentOrderSummary';
import PaymentForm from '@/components/Payment/PaymentForm';
import PaymentHeader from '@/components/Payment/PaymentHeader';
import { useEnhancedPaymentLogic } from '@/hooks/useEnhancedPaymentLogic';
import { useLocation } from 'react-router-dom';

const Payment = () => {
const paymentLogic = useEnhancedPaymentLogic();

  // Return null if user is not authenticated (redirect handled in hook)
  if (!paymentLogic) {
    return null;
  }

  const {
    serviceData,
    servicesNeeded,
    baseAmount,
    finalAmount,
    subscriptionTier,
    paymentMethod,
    setPaymentMethod,
    paymentData,
    handleInputChange,
    handlePayment,
    subscription,
    isCreatingTransaction,
    navigate,
    subscriptionToGet
  } = paymentLogic;

  console.log('Payment data:', paymentData);

  const handleBack = () => {
    navigate('/post-service', { state: { serviceData } });
  };

  return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <PaymentHeader />

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <PaymentOrderSummary 
            subscription={subscription}
            servicesNeeded={servicesNeeded}
            amount={baseAmount}
            serviceData={serviceData}
            finalAmount={finalAmount}
            subscriptionTier={subscriptionTier}
            subscriptionToGet={subscriptionToGet}
            discount={paymentLogic.getDiscount()}
          />

          {/* Payment Form */}
          <PaymentForm
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            paymentData={paymentData}
            onInputChange={handleInputChange}
            onSubmit={handlePayment}
            finalAmount={finalAmount}
            isCreatingTransaction={isCreatingTransaction}
            onBack={handleBack}
            couponCode={paymentLogic.couponCode}
            setCouponCode={paymentLogic.setCouponCode}
            appliedCoupon={paymentLogic.appliedCoupon}
            isValidating={paymentLogic.isValidating}
            validateCoupon={paymentLogic.validateCoupon}
            removeCoupon={paymentLogic.removeCoupon}
          />
        </div>
      </div>
  );
};

export default Payment;
