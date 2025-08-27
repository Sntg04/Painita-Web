'use client';

import React from 'react';
import {
  TextField,
  Typography,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Box,
} from '@mui/material';
import { relationshipTypes } from '@/utils/colombiaData';
import FormularioContainer from './FormularioContainer';
import { fieldStyles } from './fieldStyles';

export default function Step4_Referencias({ formData, setFormData, onNext, onPrev }) {
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <FormularioContainer>
      <Box sx={{ maxWidth: 600, margin: '0 auto', backgroundColor: '#fff', borderRadius: 2, boxShadow: 3, padding: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#B00020', fontWeight: 700 }}>
          👥 Referencias Personales
        </Typography>
        <Typography variant="subtitle1" gutterBottom color="text.secondary">
          Referencia Uno
        </Typography>
        <FormControl fullWidth margin="normal" sx={fieldStyles}>
          <InputLabel sx={{ color: '#B00020' }}>Relación</InputLabel>
          <Select
            name="reference_one_relationship"
            label="Relación"
            value={formData.reference_one_relationship || ''}
            onChange={handleChange}
          >
            {relationshipTypes.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          name="reference_one_name"
          label="Nombre Completo"
          fullWidth
          margin="normal"
          value={formData.reference_one_name || ''}
          onChange={handleChange}
          sx={fieldStyles}
        />
        <TextField
          name="reference_one_phone"
          label="Número de Celular"
          fullWidth
          margin="normal"
          value={formData.reference_one_phone || ''}
          onChange={handleChange}
          sx={fieldStyles}
        />
        <Divider sx={{ my: 3, borderColor: '#ddd' }} />
        <Typography variant="subtitle1" gutterBottom color="text.secondary">
          Referencia Dos
        </Typography>
        <FormControl fullWidth margin="normal" sx={fieldStyles}>
          <InputLabel sx={{ color: '#B00020' }}>Relación</InputLabel>
          <Select
            name="reference_two_relationship"
            label="Relación"
            value={formData.reference_two_relationship || ''}
            onChange={handleChange}
          >
            {relationshipTypes.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          name="reference_two_name"
          label="Nombre Completo"
          fullWidth
          margin="normal"
          value={formData.reference_two_name || ''}
          onChange={handleChange}
          sx={fieldStyles}
        />
        <TextField
          name="reference_two_phone"
          label="Número de Celular"
          fullWidth
          margin="normal"
          value={formData.reference_two_phone || ''}
          onChange={handleChange}
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
            disabled={![formData.reference_one_name, formData.reference_one_phone, formData.reference_two_name, formData.reference_two_phone].every(Boolean)}
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
