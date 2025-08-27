// backend/controllers/authController.js
import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';
import twilio from 'twilio';

// Asegúrate de usar las mismas variables de entorno definidas en .env
// .env define TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);
const twilioPhone = process.env.TWILIO_PHONE;

// Almacenamiento temporal de OTPs (puedes escalarlo con PostgreSQL si lo deseas)
const otpStore = new Map();

export const sendOTP = async (req, res) => {
  const { phone } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, otp); // Guarda temporalmente

  try {
    await twilioClient.messages.create({
      body: `Tu código Painita es: ${otp}`,
      from: twilioPhone,
      to: `+57${phone}`, // Asegura formato internacional
    });

    console.log(`📲 OTP enviado a ${phone}: ${otp}`);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error al enviar OTP:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const verifyOTP = async (req, res) => {
  const { phone, code } = req.body;
  const storedOtp = otpStore.get(phone);

  if (storedOtp && storedOtp === code) {
    otpStore.delete(phone); // Elimina después de verificar
    console.log(`✅ OTP verificado para ${phone}`);
    return res.json({ verified: true });
  }

  console.warn(`❌ OTP incorrecto para ${phone}`);
  return res.json({ verified: false });
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
