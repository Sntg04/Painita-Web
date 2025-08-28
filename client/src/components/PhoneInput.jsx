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
        variant="outlined"
        sx={{
          // Color del label
          '& .MuiInputLabel-root': { color: 'text.primary' },
          '& .MuiInputLabel-root.Mui-focused': { color: '#900018' },
          // Borde del input (outlined)
          '& .MuiOutlinedInput-root': {
            // Borde siempre rojo
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#900018 !important' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#900018 !important' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#900018 !important' },
            // eliminar focus ring/halo
            '&.Mui-focused': { boxShadow: 'none !important', outline: 'none !important' },
            '&:focus-within': { boxShadow: 'none !important', outline: 'none !important' },
            '&.Mui-focused:after': { boxShadow: 'none', border: 'none' },
            '&:after': { boxShadow: 'none', border: 'none' },
          },
          // Texto negro y sin outline (incluye estado error)
          '& .MuiInputBase-input': { color: '#000000 !important' },
          '& .MuiInputBase-input:focus': { outline: 'none !important', color: '#000000 !important' },
          '& .MuiFormControl-root.Mui-error .MuiInputBase-input': { color: '#000000 !important' },
          '& .MuiOutlinedInput-root.Mui-error .MuiInputBase-input': { color: '#000000 !important' },
          '& input': { color: '#000000 !important' },
          '& input:focus': { color: '#000000 !important' },
          '& .MuiInputBase-input:focus-visible': { outline: 'none !important' },
          // Edge/Chromium
          '& input:focus-visible': { outline: 'none !important' },
          '& input:focus': { outline: 'none !important' },
          caretColor: '#000000',
          '& input:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 1000px #fff inset',
            WebkitTextFillColor: '#000000',
          },
        }}
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
