import { Box, Typography, TextField, Button } from '@mui/material';
import { useState } from 'react';
import axios from 'axios';

export default function OTPVerification({ phone, onVerified }) {
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setCodigo(value);
      setError('');
    } else {
      setError('Máximo 6 dígitos');
    }
  };

  const handleVerificar = async () => {
    if (codigo.length !== 6) {
      setError('Ingresa un código válido de 6 dígitos');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/verify-otp', {
        phone,
        code: codigo,
      });

      if (response.data.verified) {
        setMensaje('✅ Verificación exitosa');
        setError('');
        console.log('OTP verificado, avanzando a contraseña');
        setTimeout(() => {
          onVerified(); // Avanza al paso de contraseña
        }, 1000);
      } else {
        setError('Código incorrecto');
        setMensaje('');
      }
    } catch (err) {
      console.error('Error al verificar OTP:', err);
      setError('Error de conexión con el servidor');
      setMensaje('');
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: 'auto',
        mt: 6,
        p: 4,
        bgcolor: '#fff',
        borderRadius: 2,
        boxShadow: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="h6" gutterBottom color="#B00020">
        Ingresa el código recibido
      </Typography>

      <TextField
        fullWidth
        label="Código OTP"
        value={codigo}
        onChange={handleChange}
        error={!!error}
        helperText={error}
        inputProps={{ maxLength: 6 }}
        margin="normal"
      />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleVerificar}
      >
        Verificar
      </Button>

      {mensaje && (
        <Typography variant="body2" color="success.main" mt={2}>
          {mensaje}
        </Typography>
      )}
    </Box>
  );
}
