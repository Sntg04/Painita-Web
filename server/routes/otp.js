const express = require('express');
const router = express.Router();
const twilio = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Enviar código OTP
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

  if (!phone || phone.length !== 10) {
    return res.status(400).json({ error: 'Número de celular inválido' });
  }

  try {
    const verification = await twilio.verify
      .services(process.env.TWILIO_SERVICE_SID)
      .verifications.create({
        to: `+57${phone}`, // Asumiendo Colombia
        channel: 'sms',
      });

    res.json({ success: true, status: verification.status });
  } catch (err) {
    console.error('Error al enviar OTP:', err.message);
    res.status(500).json({ error: 'No se pudo enviar el código OTP' });
  }
});

// Verificar código OTP
router.post('/verify-otp', async (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ error: 'Faltan datos para verificar' });
  }

  try {
    const result = await twilio.verify
      .services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to: `+57${phone}`,
        code,
      });

    const verified = result.status === 'approved';
    res.json({ verified });
  } catch (err) {
    console.error('Error al verificar OTP:', err.message);
    res.status(500).json({ error: 'Verificación fallida' });
  }
});

module.exports = router;
