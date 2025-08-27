import { Box, Typography, TextField, Button } from '@mui/material';
import { useState } from 'react';

export default function PhoneInput({ onContinue }) {
  const [celular, setCelular] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo números
    if (value.length <= 10) {
      setCelular(value);
      setError('');
    } else {
      setError('Máximo 10 dígitos');
    }
  };

  const handleSubmit = () => {
    if (celular.length === 10) {
      onContinue(celular);
    } else {
      setError('Ingresa un número válido de 10 dígitos');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 6, p: 4, bgcolor: '#fff', borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h6" gutterBottom color="#B00020">
        Ingresa tu número de celular
      </Typography>
      <TextField
        fullWidth
        label="Celular"
        value={celular}
        onChange={handleChange}
        error={!!error}
        helperText={error}
        inputProps={{ maxLength: 10 }}
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleSubmit}
      >
        Continuar
      </Button>
    </Box>
  );
}
