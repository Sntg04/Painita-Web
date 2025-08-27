import {
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
} from '@mui/material';
import { departments, citiesByDepartment } from '@/utils/colombiaData';
import FormularioContainer from './FormularioContainer';
import { fieldStyles } from './fieldStyles';

export default function Step2_Contacto({ formData, setFormData, onNext, onPrev }) {
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleDepartmentChange = (e) =>
    setFormData({ ...formData, department: e.target.value, city: '' });

  return (
    <FormularioContainer>
      <Box>
        <Typography variant="h6" gutterBottom sx={{ color: '#B00020', fontWeight: 700 }}>
          📍 Información de Residencia
        </Typography>
        <FormControl fullWidth margin="normal" sx={fieldStyles}>
          <InputLabel>Departamento</InputLabel>
          <Select
            name="department"
            label="Departamento"
            value={formData.department || ''}
            onChange={handleDepartmentChange}
          >
            {departments.map((dep) => (
              <MenuItem key={dep} value={dep}>
                {dep}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl
          fullWidth
          margin="normal"
          disabled={!formData.department}
          sx={fieldStyles}
        >
          <InputLabel>Ciudad</InputLabel>
          <Select
            name="city"
            label="Ciudad"
            value={formData.city || ''}
            onChange={handleChange}
          >
            {(citiesByDepartment[formData.department] || []).map((city) => (
              <MenuItem key={city} value={city}>
                {city}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          name="locality"
          label="Localidad / Barrio"
          fullWidth
          margin="normal"
          value={formData.locality || ''}
          onChange={handleChange}
          sx={fieldStyles}
        />
        <TextField
          name="address"
          label="Dirección de Residencia"
          fullWidth
          margin="normal"
          value={formData.address || ''}
          onChange={handleChange}
          sx={fieldStyles}
        />
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
            disabled={!formData.department || !formData.city}
            onClick={onNext}
            sx={{
              fontWeight: 'bold',
              backgroundColor: '#B00020',
              color: '#fff',
              '&:hover': { backgroundColor: '#900018' },
            }}
          >
            Siguiente
          </Button>
        </Box>
      </Box>
    </FormularioContainer>
  );
}
