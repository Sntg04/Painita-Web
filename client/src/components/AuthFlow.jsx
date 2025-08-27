import { useState, useEffect } from 'react';
import PhoneInput from './PhoneInput';
import OTPVerification from './OTPVerification';
import PasswordSetup from './PasswordSetup';
import { Box, Typography } from '@mui/material';
import { sendOTP as apiSendOTP } from '@/services/api';

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
  const [otpInfo, setOtpInfo] = useState({ sent: false, dev_otp: null, error: '' });

  useEffect(() => {
    console.log('Paso actual:', step);
  }, [step]);

  return (
    <>
      {step === 'phone' && (
        <PhoneInput
          onContinue={async (p) => {
            setPhone(p);
            // Enviar OTP al pasar al paso OTP
            try {
              const r = await apiSendOTP(p);
              setOtpInfo({ sent: true, dev_otp: r?.data?.dev_otp || null, error: '' });
            } catch {
              setOtpInfo({ sent: false, dev_otp: null, error: 'No se pudo enviar el código. Intenta de nuevo.' });
            }
            setStep('otp');
          }}
        />
      )}

      {step === 'otp' && (
        <OTPVerification phone={phone} onVerified={() => setStep('password')} devOtp={otpInfo.dev_otp} />
      )}

      {step === 'password' && (
        <PasswordSetup phone={phone} onSuccess={() => setStep('success')} />
      )}

      {step === 'success' && <SuccessMessage />}
    </>
  );
}
