import { useState, useEffect } from 'react';
import PhoneInput from './PhoneInput';
import OTPVerification from './OTPVerification';
import PasswordSetup from '../pages/PasswordSetup';
import { Box, Typography } from '@mui/material';

function SuccessMessage() {
  return (
    <Box sx={{ mt: 6, textAlign: 'center' }}>
      <Typography variant="h5" color="success.main">
        🎉 ¡Cuenta creada exitosamente!
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Puedes continuar al pago o explorar tus opciones de crédito.
      </Typography>
    </Box>
  );
}

export default function AuthFlow() {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    console.log('Paso actual:', step);
  }, [step]);

  return (
    <>
      {step === 'phone' && (
        <PhoneInput onNext={(p) => {
          setPhone(p);
          setStep('otp');
        }} />
      )}

      {step === 'otp' && (
        <OTPVerification phone={phone} onVerified={() => setStep('password')} />
      )}

      {step === 'password' && (
        <PasswordSetup phone={phone} onSuccess={() => setStep('success')} />
      )}

      {step === 'success' && <SuccessMessage />}
    </>
  );
}
