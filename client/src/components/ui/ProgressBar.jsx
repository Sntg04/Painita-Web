import { Box, LinearProgress, Typography } from '@mui/material';

export default function ProgressBar({ paso, total }) {
  const progreso = ((paso + 1) / total) * 100;

  const mensajes = [
    'Conectando contigo...',
    'Aseguramos tu contacto',
    'Evaluando tu perfil financiero',
    'Validando tus referencias',
    'Preparando tu desembolso',
    'Resumen claro y transparente',
    '¡Listo para solicitar tu crédito!'
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <LinearProgress variant="determinate" value={progreso} sx={{ height: 8, borderRadius: 4 }} />
      <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'white' }}>
        Paso {paso + 1} de {total} — {mensajes[paso]}
      </Typography>
    </Box>
  );
}
