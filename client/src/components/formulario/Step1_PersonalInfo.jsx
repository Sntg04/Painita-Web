'use client';

import {
  TextField,
  Typography,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button
} from '@mui/material';
import { educationLevels, maritalStatuses, genders } from '@/utils/colombiaData';

const fieldStyles = {
  '& label': { color: '#d32f2f' },
  '& label.Mui-focused': { color: '#b71c1c' },
  '& .MuiInputBase-input': { color: '#000000' },
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: '#d32f2f' },
    '&:hover fieldset': { borderColor: '#b71c1c' },
    '&.Mui-focused fieldset': { borderColor: '#d32f2f' },
    '& .MuiSelect-icon': { color: '#000000' }
  }
};

export default function Step1_PersonalInfo({ formData, setFormData, onNext, onPrev }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isValid = () => {
    const requiredFields = [
      'first_name',
      'last_name',
      'email',
      'document_number',
      'birth_date',
      'document_issue_date',
      'education_level',
      'marital_status',
      'gender'
    ];
    return requiredFields.every(field => formData[field]?.trim());
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          maxWidth: 600,
          margin: '0 auto',
          backgroundColor: '#fff',
          borderRadius: 2,
          boxShadow: 3,
          padding: 4,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontFamily: 'Montserrat', fontWeight: 700, textAlign: 'center', letterSpacing: 1, mb: 2, color: '#B00020' }}>
          Solicitud de Crédito Painita
        </Typography>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: '#B00020', fontWeight: 700 }}>
          👤 Información Personal
        </Typography>
        <Box>
          <TextField
            name="first_name"
            label="Primer Nombre"
            fullWidth
            margin="normal"
            value={formData.first_name || ''}
            onChange={handleChange}
            required
            sx={fieldStyles}
          />
          <TextField
            name="second_name"
            label="Segundo Nombre (Opcional)"
            fullWidth
            margin="normal"
            value={formData.second_name || ''}
            onChange={handleChange}
            sx={fieldStyles}
          />
          <TextField
            name="last_name"
            label="Primer Apellido"
            fullWidth
            margin="normal"
            value={formData.last_name || ''}
            onChange={handleChange}
            required
            sx={fieldStyles}
          />
          <TextField
            name="second_last_name"
            label="Segundo Apellido (Opcional)"
            fullWidth
            margin="normal"
            value={formData.second_last_name || ''}
            onChange={handleChange}
            sx={fieldStyles}
          />
          <TextField
            name="email"
            label="Correo Electrónico"
            type="email"
            fullWidth
            margin="normal"
            value={formData.email || ''}
            onChange={handleChange}
            required
            sx={fieldStyles}
          />
          <TextField
            name="document_number"
            label="Número de Cédula"
            fullWidth
            margin="normal"
            value={formData.document_number || ''}
            onChange={handleChange}
            required
            sx={fieldStyles}
          />
          <TextField
            name="birth_date"
            label="Fecha de Nacimiento"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin="normal"
            value={formData.birth_date || ''}
            onChange={handleChange}
            required
            sx={fieldStyles}
          />
          <TextField
            name="document_issue_date"
            label="Fecha de Expedición de la Cédula"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin="normal"
            value={formData.document_issue_date || ''}
            onChange={handleChange}
            required
            sx={fieldStyles}
          />
          <FormControl fullWidth margin="normal" required sx={fieldStyles}>
            <InputLabel sx={{ color: '#B00020' }}>Nivel Educativo</InputLabel>
            <Select
              name="education_level"
              value={formData.education_level || ''}
              onChange={handleChange}
              label="Nivel Educativo"
            >
              {educationLevels.map(level => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required sx={fieldStyles}>
            <InputLabel sx={{ color: '#B00020' }}>Estado Civil</InputLabel>
            <Select
              name="marital_status"
              value={formData.marital_status || ''}
              onChange={handleChange}
              label="Estado Civil"
            >
              {maritalStatuses.map(status => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required sx={fieldStyles}>
            <InputLabel sx={{ color: '#B00020' }}>Género</InputLabel>
            <Select
              name="gender"
              value={formData.gender || ''}
              onChange={handleChange}
              label="Género"
            >
              {genders.map(gender => (
                <MenuItem key={gender} value={gender}>
                  {gender}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          {onPrev && (
            <Button
              variant="contained"
              onClick={onPrev}
              sx={{
                fontWeight: 'bold',
                backgroundColor: '#B00020',
                color: '#fff',
                '&:hover': { backgroundColor: '#900018' },
              }}
            >
              Atrás
            </Button>
          )}
          <Button
            variant="contained"
            disabled={!isValid()}
            onClick={() => {
              if (isValid()) {
                onNext();
              } else {
                alert('Por favor completa todos los campos obligatorios.');
              }
            }}
            sx={{
              fontWeight: 'bold',
              backgroundColor: '#B00020',
              color: '#fff',
              '&:hover': { backgroundColor: '#900018' },
            }}
          >
            Continuar
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
