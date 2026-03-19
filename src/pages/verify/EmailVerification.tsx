import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const EmailVerification = () => {
    const { params } = useParams();
    const navigate = useNavigate();

    if (!params.includes('token')) {
        navigate('/');
    }

  return (
    <div>EmailVerification</div>
  )
}

export default EmailVerification