// src/components/PasswordSetup.jsx
import React, { useState } from 'react';
import { createUser } from '@/services/api';
import { Button, TextField, Typography, Box } from '@mui/material';

const PasswordSetup = ({ phone, monto, plazo }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres.');
    }

    if (password !== confirm) {
      return setError('Las contraseñas no coinciden.');
    }

    setLoading(true);

    try {
      const response = await createUser({ phone, password });

      if (response.status === 201 && response.data.success) {
        console.log(`🎉 Usuario creado: ${phone}`);
        // Guarda el user_id en localStorage para el formulario
        if (response.data.user_id) {
          localStorage.setItem('user_id', response.data.user_id);
        }
        // Refuerzo: guardar monto y plazo seleccionados en localStorage
        if (monto) localStorage.setItem('monto', monto);
        if (plazo) localStorage.setItem('plazo', plazo);
        // Inicia sesión automáticamente y navega al formulario con datos
        const user_id = response.data.user_id;
        const params = new URLSearchParams({
          celular: phone,
          monto: monto || '',
          plazo: plazo || '',
          user_id: user_id || ''
        });
        window.location.href = `/formulario?${params.toString()}`;
      } else {
        setError('No pudimos crear tu cuenta. Intenta de nuevo.');
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error;

      if (status === 409) {
        setError('Este número ya está registrado. ¿Quieres iniciar sesión?');
      } else if (status === 400) {
        setError('Faltan datos. Revisa tu contraseña.');
      } else {
        setError(msg || 'Error al conectar con el servidor.');
      }

      console.error('❌ Error al registrar usuario:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        mt: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: 400,
        mx: 'auto',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Crea tu contraseña
      </Typography>

      <TextField
        label="Contraseña"
        type="password"
        fullWidth
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        inputProps={{ minLength: 6 }}
        sx={{
          '& .MuiInputBase-root': { color: '#B00020' },
          '& label': { color: '#B00020' },
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#B00020' },
          '& .MuiFormHelperText-root': { color: '#B00020' },
        }}
      />

      <TextField
        label="Confirmar contraseña"
        type="password"
        fullWidth
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        inputProps={{ minLength: 6 }}
        sx={{
          '& .MuiInputBase-root': { color: '#B00020' },
          '& label': { color: '#B00020' },
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#B00020' },
          '& .MuiFormHelperText-root': { color: '#B00020' },
        }}
      />

      {error && (
        <Typography color="error">
          {error}
        </Typography>
      )}

      <Button
        type="submit"
        variant="contained"
        sx={{
          backgroundColor: '#B00020',
          color: '#fff',
          fontWeight: 'bold',
          '&:hover': { backgroundColor: '#900018' }
        }}
        disabled={loading}
      >
        {loading ? 'Creando cuenta...' : 'Continuar'}
      </Button>
    </Box>
  );
};

export default PasswordSetup;
