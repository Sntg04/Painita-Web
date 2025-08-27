import { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import axios from 'axios';

export default function LoanForm({ onOtpSent }) {
  const [form, setForm] = useState({
    monto: '',
    cedula: '',
    celular: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const enviarOTP = async () => {
    try {
      await axios.post('/api/send-otp', {
        phone: form.celular,
      });
      onOtpSent();
    } catch (err) {
      console.error('Error al enviar OTP', err);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 3, bgcolor: '#fff', borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h5" gutterBottom color="primary">
        Solicita tu préstamo
      </Typography>
      <TextField
        fullWidth
        label="Monto"
        name="monto"
        value={form.monto}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Cédula"
        name="cedula"
        value={form.cedula}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Celular"
        name="celular"
        value={form.celular}
        onChange={handleChange}
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={enviarOTP}
      >
        Enviar código de verificación
      </Button>
    </Box>
  );
}
