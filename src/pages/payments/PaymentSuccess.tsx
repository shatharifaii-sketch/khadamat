import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [verified, setVerified] = useState(null);

useEffect(() => {
  if (!sessionId) return;

  //TODO: verifySession(sessionId);
}, [sessionId]);

if (verified === null) return <div>Loading...</div>;
if (!verified) return <Navigate to="/" replace />;

  return (
    <div>PaymentSuccess</div>
  )
}

export default PaymentSuccess