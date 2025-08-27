import { Box, Typography } from '@mui/material';

const LoginHeader = () => (
  <Box textAlign="center" mb={3}>
    <Typography variant="h4" fontWeight="bold" color="primary">
      Bienvenido a Painita
    </Typography>
    <Typography variant="subtitle1" color="text.secondary">
      Crédito instantáneo con confianza y diseño premium
    </Typography>
  </Box>
);

export default LoginHeader;
