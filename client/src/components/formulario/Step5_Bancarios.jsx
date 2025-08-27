'use client';

import React from 'react';
import {
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Box,
} from '@mui/material';
import { banks } from '@/utils/colombiaData';
import FormularioContainer from './FormularioContainer';
import { fieldStyles } from './fieldStyles';

export default function Step5_Bancarios({ formData, setFormData, onNext, onPrev }) {
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const cuentasIguales =
    formData.account_number &&
    formData.account_number_confirm &&
    formData.account_number === formData.account_number_confirm;

  return (
    <FormularioContainer>
      <Box sx={{ maxWidth: 600, margin: '0 auto', backgroundColor: '#fff', borderRadius: 2, boxShadow: 3, padding: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#B00020', fontWeight: 700 }}>
          🏦 Información Bancaria
        </Typography>
        <FormControl fullWidth margin="normal" required sx={fieldStyles}>
          <InputLabel sx={{ color: '#B00020' }}>Banco</InputLabel>
          <Select
            name="bank_name"
            value={formData.bank_name || ''}
            onChange={handleChange}
            label="Banco"
          >
            {banks.map((bank) => (
              <MenuItem key={bank} value={bank}>{bank}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          name="account_number"
          label="Número de Cuenta"
          fullWidth
          margin="normal"
          value={formData.account_number || ''}
          onChange={handleChange}
          required
          sx={fieldStyles}
        />
        <TextField
          name="account_number_confirm"
          label="Confirmar Número de Cuenta"
          fullWidth
          margin="normal"
          value={formData.account_number_confirm || ''}
          onChange={handleChange}
          required
          error={formData.account_number_confirm && formData.account_number !== formData.account_number_confirm}
          helperText={formData.account_number_confirm && formData.account_number !== formData.account_number_confirm ? 'Los números no coinciden' : ''}
          sx={fieldStyles}
        />
        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          {onPrev && (
            <Button
              variant="contained"
              onClick={onPrev}
              sx={{ fontWeight: 'bold', backgroundColor: '#B00020', color: '#fff', '&:hover': { backgroundColor: '#900018' } }}
            >
              Atrás
            </Button>
          )}
          <Button
            variant="contained"
            disabled={!formData.bank_name || !formData.account_number || !formData.account_number_confirm || !cuentasIguales}
            onClick={onNext}
            sx={{ fontWeight: 'bold', backgroundColor: '#B00020', color: '#fff', '&:hover': { backgroundColor: '#900018' } }}
          >
            Siguiente
          </Button>
        </Box>
      </Box>
    </FormularioContainer>
  );
}
