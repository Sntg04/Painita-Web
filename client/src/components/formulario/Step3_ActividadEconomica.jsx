'use client';

import React from 'react';
import {
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Box,
} from '@mui/material';
import {
  employmentStatuses,
  paymentCycles,
  incomeRanges,
} from '@/utils/colombiaData';
import FormularioContainer from './FormularioContainer';
import { fieldStyles } from './fieldStyles';

export default function Step3_ActividadEconomica({
  formData,
  setFormData,
  onNext,
  onPrev,
}) {
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <FormularioContainer>
      <Box sx={{ maxWidth: 600, margin: '0 auto', backgroundColor: '#fff', borderRadius: 2, boxShadow: 3, padding: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#B00020', fontWeight: 700 }}>
          💼 Información Laboral
        </Typography>
        <FormControl fullWidth margin="normal" required sx={fieldStyles}>
          <InputLabel sx={{ color: '#B00020' }}>Situación Laboral</InputLabel>
          <Select
            name="employment_status"
            value={formData.employment_status || ''}
            onChange={handleChange}
            label="Situación Laboral"
          >
            {employmentStatuses.map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal" required sx={fieldStyles}>
          <InputLabel sx={{ color: '#B00020' }}>Ciclo de Pago</InputLabel>
          <Select
            name="payment_cycle"
            value={formData.payment_cycle || ''}
            onChange={handleChange}
            label="Ciclo de Pago"
          >
            {paymentCycles.map((cycle) => (
              <MenuItem key={cycle} value={cycle}>{cycle}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal" required sx={fieldStyles}>
          <InputLabel sx={{ color: '#B00020' }}>Ingresos Mensuales</InputLabel>
          <Select
            name="income_range"
            value={formData.income_range || ''}
            onChange={handleChange}
            label="Ingresos Mensuales"
          >
            {incomeRanges.map((range) => (
              <MenuItem key={range} value={range}>
                {range.replace(/_/g, ' ').replace('K', '000').replace('M', '.000.000')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
            disabled={!formData.employment_status || !formData.payment_cycle || !formData.income_range}
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
