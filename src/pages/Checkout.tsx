
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new payment page
    navigate('/payment');
  }, [navigate]);

  return null;
};

export default Checkout;
