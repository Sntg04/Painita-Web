// backend/routes/authRoutes.js
import express from 'express';
import {
  sendOTP,
  verifyOTP,
  registerUser,
  loginUser,
  resetPassword,
  debugTwilio,
} from '../controllers/authController.js';

const router = express.Router();

// Log all requests that hit this router (debug)
router.use((req, _res, next) => {
  console.log('[authRoutes]', req.method, req.url);
  next();
});

// Rutas de autenticación
router.post('/send-otp', sendOTP);       // Enviar código OTP
router.post('/verify-otp', verifyOTP);   // Verificar código OTP
router.post('/register', registerUser);  // Crear usuario con contraseña
router.post('/login', loginUser);        // 🔐 Iniciar sesión con celular y contraseña
router.post('/reset-password', resetPassword); // 🔁 Restablecer contraseña con OTP

// Debug endpoint (no sensible data leaked)
router.get('/debug/twilio', debugTwilio);

export default router;
