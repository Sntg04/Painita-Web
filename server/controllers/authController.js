// backend/controllers/authController.js
import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';
import twilio from 'twilio';

// Asegúrate de usar las mismas variables de entorno definidas en .env
// .env define TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE;
const twilioServiceSid = process.env.TWILIO_SERVICE_SID;
// Solo inicializar cliente Twilio si hay credenciales
let twilioClient = null;
if (accountSid && authToken) {
  try {
    twilioClient = twilio(accountSid, authToken);
  } catch (e) {
    console.warn('Twilio no inicializado:', e.message);
    twilioClient = null;
  }
}

// Almacenamiento temporal de OTPs (puedes escalarlo con PostgreSQL si lo deseas)
const otpStore = new Map();

export const debugTwilio = (_req, res) => {
  const mask = (v) => (v ? `${String(v).slice(0, 6)}…${String(v).slice(-4)}` : null);
  return res.json({
    node_env: process.env.NODE_ENV || 'development',
    api_base_url_hint: process.env.VITE_API_BASE_URL || '/api',
    accountSid: mask(accountSid),
    serviceSid: mask(twilioServiceSid),
    hasTwilioClient: !!twilioClient,
    hasTwilioPhone: !!twilioPhone,
    viaVerifyEnabled: !!(accountSid && authToken && twilioServiceSid),
    allowTrialDevOTP: process.env.ALLOW_TRIAL_DEV_OTP === 'true',
  });
};

export const sendOTP = async (req, res) => {
  const { phone } = req.body;
  const allowTrialDevOTP = process.env.ALLOW_TRIAL_DEV_OTP === 'true';

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, otp); // Guarda temporalmente

  try {
    // 1) Preferir Twilio Verify si SERVICE_SID está configurado
    if (accountSid && authToken && twilioServiceSid) {
      try {
        const client = twilio(accountSid, authToken);
        const v = await client.verify.v2.services(twilioServiceSid).verifications.create({
          to: `+57${phone}`,
          channel: 'sms',
        });
        console.log(
          `📲 OTP (Verify) solicitado a ${phone}: status=${v.status} (acct ${String(accountSid).slice(0, 6)}… svc ${String(
            twilioServiceSid
          ).slice(0, 6)}…)`
        );
        return res.json({ success: true, via: 'verify', status: v.status });
      } catch (e) {
        console.error('❌ Twilio Verify fallo:', e.message);
        // Manejo especial para cuentas de prueba que no pueden enviar a números no verificados
        const msg = (e?.message || '').toLowerCase();
        const isTrialRestriction = msg.includes('trial') || msg.includes('no se puede enviar') || msg.includes('unverified') || e?.code === 21608;
        if (isTrialRestriction) {
          const body = {
            success: false,
            code: 'TRIAL_RESTRICTION',
            error:
              'Tu cuenta de Twilio es de prueba y no puede enviar SMS a números no verificados. Verifica el número en Twilio o usa un número verificado.',
          };
          if (process.env.NODE_ENV !== 'production' || allowTrialDevOTP) body.dev_otp = otp;
          return res.status(400).json(body);
        }
        // Continúa al siguiente método si falla Verify por otro motivo
      }
    }

    // 2) Fallback: mensajes SMS directos con código propio si twilioPhone está configurado
    if (twilioClient && twilioPhone) {
      await twilioClient.messages.create({
        body: `Tu código Painita es: ${otp}`,
        from: twilioPhone,
        to: `+57${phone}`,
      });
      console.log(`📲 OTP (SMS) enviado a ${phone}: ${otp}`);
      return res.json({ success: true, via: 'sms' });
    }

    // 3) Sin credenciales Twilio: modo desarrollo
    console.warn('TWILIO no configurado. Modo desarrollo: devolviendo dev_otp');
    return res.json({ success: true, dev_otp: otp, via: 'dev' });
  } catch (err) {
    console.error('❌ Error al enviar OTP:', err.message);
    const msg = (err?.message || '').toLowerCase();
    const isTrialRestriction = msg.includes('trial') || msg.includes('no se puede enviar') || msg.includes('unverified') || err?.code === 21608;
    if (isTrialRestriction) {
      const body = {
        success: false,
        code: 'TRIAL_RESTRICTION',
        error:
          'Tu cuenta de Twilio es de prueba y no puede enviar SMS a números no verificados. Verifica el número en Twilio o usa un número verificado.',
      };
      if (process.env.NODE_ENV !== 'production' || allowTrialDevOTP) body.dev_otp = otp;
      return res.status(400).json(body);
    }
    const body = { success: false, error: 'No se pudo enviar el código. Intenta de nuevo más tarde.' };
    if (process.env.NODE_ENV !== 'production') body.detalle = err.message;
    res.status(500).json(body);
  }
};

export const verifyOTP = async (req, res) => {
  const { phone, code } = req.body;
  try {
    // 1) Verificación con Twilio Verify si está configurado
    if (accountSid && authToken && twilioServiceSid) {
      try {
        const client = twilio(accountSid, authToken);
        const result = await client.verify.v2.services(twilioServiceSid).verificationChecks.create({
          to: `+57${phone}`,
          code,
        });
        const verified = result.status === 'approved';
        console.log(`✅ Verificación (Verify) para ${phone}: ${verified ? 'OK' : 'FAIL'}`);
        if (verified) return res.json({ verified: true });
      } catch (e) {
        console.warn('⚠️ Error al verificar con Twilio Verify, intentando fallback local:', e.message);
        // continúa al fallback local
      }
    }

    // 2) Fallback local con otpStore
    const storedOtp = otpStore.get(phone);
    if (storedOtp && storedOtp === code) {
      otpStore.delete(phone);
      console.log(`✅ Verificación (local) para ${phone}`);
      return res.json({ verified: true });
    }
    console.warn(`❌ OTP incorrecto para ${phone}`);
    return res.json({ verified: false });
  } catch (e) {
    console.error('❌ Error al verificar OTP:', e.message);
    return res.status(500).json({ verified: false, error: e.message });
  }
};

export const registerUser = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ success: false, error: 'Faltan datos obligatorios.' });
  }

  try {
  const existing = await pool.query('SELECT id FROM clientes WHERE phone = $1', [phone]);

    if (existing.rows.length > 0) {
      console.warn(`⚠️ Usuario ya registrado: ${phone}`);
      return res.status(409).json({ success: false, error: 'Este número ya está registrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO clientes (phone, password_hash) VALUES ($1, $2) RETURNING id',
      [phone, hashedPassword]
    );
    const user_id = result.rows[0].id;

    console.log(`🎉 Usuario registrado con éxito: ${phone}`);
    res.status(201).json({ success: true, user_id });
  } catch (err) {
  console.error('❌ Error al registrar usuario:', err);
  const body = { success: false, error: 'Error interno al crear el usuario.' };
  if (process.env.NODE_ENV !== 'production') body.detalle = err.message;
  res.status(500).json(body);
  }
};

export const loginUser = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ success: false, error: 'Faltan datos de acceso.' });
  }

  try {
  const result = await pool.query('SELECT id, password_hash FROM clientes WHERE phone = $1', [phone]);

    if (result.rows.length === 0) {
      console.warn(`🔒 Intento de login con número no registrado: ${phone}`);
      return res.status(401).json({ success: false, error: 'Número no registrado.' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (match) {
      console.log(`✅ Login exitoso para ${phone}`);
      // Devuelve el user_id para asociar formularios
      return res.json({ success: true, user_id: user.id });
    } else {
      console.warn(`❌ Contraseña incorrecta para ${phone}`);
      return res.status(401).json({ success: false, error: 'Contraseña incorrecta.' });
    }
  } catch (err) {
  console.error('❌ Error al iniciar sesión:', err);
  const body = { success: false, error: 'Error interno en el login.' };
  if (process.env.NODE_ENV !== 'production') body.detalle = err.message;
  res.status(500).json(body);
  }
};

// Restablecer contraseña con OTP
export const resetPassword = async (req, res) => {
  const { phone, code, password } = req.body;

  if (!phone || !code || !password) {
    return res.status(400).json({ success: false, error: 'Faltan datos para restablecer.' });
  }

  try {
    const storedOtp = otpStore.get(phone);
    if (!storedOtp || storedOtp !== code) {
      return res.status(401).json({ success: false, error: 'Código OTP inválido o expirado.' });
    }

    // OTP válido: consumirlo
    otpStore.delete(phone);

    const result = await pool.query('SELECT id FROM clientes WHERE phone = $1', [phone]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Número no registrado.' });
    }

    const hash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE clientes SET password_hash = $1 WHERE phone = $2', [hash, phone]);
    return res.json({ success: true });
  } catch (err) {
    console.error('❌ Error al restablecer contraseña:', err);
    const body = { success: false, error: 'Error interno al restablecer.' };
    if (process.env.NODE_ENV !== 'production') body.detalle = err.message;
    return res.status(500).json(body);
  }
};
