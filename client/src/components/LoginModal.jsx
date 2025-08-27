// src/components/LoginModal.jsx
import { Box, Typography, TextField, Button, Modal } from '@mui/material';
import { useState } from 'react';
import { login, sendOTP, verifyOTP, resetPassword } from '@/services/api';

export default function LoginModal({ open, onClose, onLoginSuccess }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgot, setForgot] = useState(false);
  const [code, setCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [step, setStep] = useState('login'); // 'login' | 'otp' | 'newpass'
  const [devOtp, setDevOtp] = useState('');

  const handleLogin = async () => {
    setError('');
    const cleanedPhone = phone.replace(/\D/g, '').slice(0, 10);
    if (cleanedPhone.length !== 10 || password.length < 6) return setError('Número o contraseña inválidos');
    try {
      const response = await login({ phone: cleanedPhone, password });
      if (response.data.success) {
        if (response.data.user_id) localStorage.setItem('user_id', response.data.user_id);
        onLoginSuccess?.();
        onClose?.();
        setPhone('');
        setPassword('');
        setError('');
      } else setError(response.data.error || 'Credenciales incorrectas');
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error;
      if (status === 400 || status === 401) setError(msg || 'Credenciales incorrectas');
      else setError('Error de conexión con el servidor');
    }
  };

  const startForgot = async () => {
    setError('');
    const cleanedPhone = phone.replace(/\D/g, '').slice(0, 10);
    if (cleanedPhone.length !== 10) return setError('Celular inválido');
    try {
      const r = await sendOTP(cleanedPhone);
      if (r.data?.success) {
        setDevOtp(r.data?.dev_otp || '');
        setForgot(true);
        setStep('otp');
      } else setError('No se pudo enviar el OTP');
    } catch {
      setError('Error al enviar OTP');
    }
  };

  const verifyCode = async () => {
    setError('');
    const cleanedPhone = phone.replace(/\D/g, '').slice(0, 10);
    const onlyDigits = code.replace(/\D/g, '');
    if (onlyDigits.length !== 6) return setError('Código inválido');
    try {
      const r = await verifyOTP(cleanedPhone, onlyDigits);
      if (r.data?.verified) setStep('newpass');
      else setError('Código incorrecto');
    } catch {
      setError('Error al verificar OTP');
    }
  };

  const doReset = async () => {
    setError('');
    const cleanedPhone = phone.replace(/\D/g, '').slice(0, 10);
    const onlyDigits = code.replace(/\D/g, '');
    if (newPass.length < 6) return setError('Contraseña muy corta');
    try {
      const r = await resetPassword(cleanedPhone, onlyDigits, newPass);
      if (r.data?.success) {
        setStep('login');
        setForgot(false);
        setPassword('');
        setNewPass('');
        setCode('');
        setError('');
      } else setError(r.data?.error || 'No se pudo restablecer');
    } catch {
      setError('Error de red');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ bgcolor: '#fff', p: 4, borderRadius: 2, boxShadow: 6, maxWidth: 400, mx: 'auto', mt: '10%' }}>
        <Typography variant="h6" gutterBottom color="#B00020">
          {step === 'login' ? 'Iniciar sesión' : step === 'otp' ? 'Verificar código' : 'Nueva contraseña'}
        </Typography>

        <TextField label="Celular" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} inputProps={{ maxLength: 10 }} margin="normal" />

        {step === 'login' && (
          <TextField label="Contraseña" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} inputProps={{ minLength: 6 }} margin="normal" />
        )}

        {step === 'otp' && (
          <TextField label="Código OTP" fullWidth value={code} onChange={(e) => setCode(e.target.value)} inputProps={{ maxLength: 6 }} margin="normal" />
        )}

        {step === 'newpass' && (
          <TextField label="Nueva contraseña" type="password" fullWidth value={newPass} onChange={(e) => setNewPass(e.target.value)} inputProps={{ minLength: 6 }} margin="normal" />
        )}

        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}

        {step === 'login' && (
          <>
            <Button variant="contained" color="primary" fullWidth sx={{ mt: 2, textTransform: 'none', fontWeight: 'bold', bgcolor: '#B00020', '&:hover': { bgcolor: '#A0001C' } }} onClick={handleLogin}>
              Acceder
            </Button>
            <Button variant="text" sx={{ mt: 1 }} onClick={() => setForgot(true)}>
              ¿Olvidaste tu contraseña?
            </Button>
            {forgot && (
              <Button variant="outlined" sx={{ mt: 1 }} onClick={startForgot}>
                Enviar código OTP
              </Button>
            )}
          </>
        )}

        {step === 'otp' && (
          <>
            <Button variant="contained" fullWidth sx={{ mt: 2, bgcolor: '#B00020', '&:hover': { bgcolor: '#A0001C' } }} onClick={verifyCode}>
              Verificar código
            </Button>
            <Button variant="text" sx={{ mt: 1 }} onClick={startForgot}>
              Reenviar código
            </Button>
            {devOtp && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Código de prueba (local): {devOtp}{' '}
                <Button size="small" onClick={() => setCode(String(devOtp))}>Pegar</Button>
              </Typography>
            )}
          </>
        )}

        {step === 'newpass' && (
          <Button variant="contained" fullWidth sx={{ mt: 2, bgcolor: '#B00020', '&:hover': { bgcolor: '#A0001C' } }} onClick={doReset}>
            Cambiar contraseña
          </Button>
        )}
      </Box>
    </Modal>
  );
}
