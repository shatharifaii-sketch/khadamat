
import Navigation from '@/components/Navigation';
import PaymentOrderSummary from '@/components/Payment/PaymentOrderSummary';
import PaymentForm from '@/components/Payment/PaymentForm';
import PaymentHeader from '@/components/Payment/PaymentHeader';
import { usePaymentLogic } from '@/hooks/usePaymentLogic';

const Payment = () => {
  const paymentLogic = usePaymentLogic();

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
    navigate
  } = paymentLogic;

  const handleBack = () => {
    navigate('/post-service', { state: { serviceData } });
  };

  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      
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
          />
        </div>
      </div>
    </div>
  );
};

export default Payment;
