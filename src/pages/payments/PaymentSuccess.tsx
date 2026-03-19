import useStripe from "@/hooks/use-stripe";
import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { verifySession, isVerifySessionSuccess } = useStripe();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(null);
  const [subscriptiondata, setSubscriptiondata] = useState(null);

useEffect(() => {
  if (!sessionId) return;

  const data = verifySession(sessionId);

  if (isVerifySessionSuccess) {
    setVerified(true);

    if (data?.subscription) {
      setSubscriptiondata(data.subscription);
    }
  };
  
}, [sessionId]);

if (verified === null) return <div>Loading...</div>;
if (!verified) return <Navigate to="/" replace />;

  return (
    <div>
      Payment successful!
    </div>
  )
}

export default PaymentSuccess