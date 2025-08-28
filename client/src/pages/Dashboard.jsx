import { useEffect } from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import TopBar from '../components/ui/TopBar';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { monto = 300000, plazo = 30 } = location.state || {};

  useEffect(() => {
    const completo = localStorage.getItem('formularioCompleto');
    if (completo !== 'true') {
      navigate('/formulario');
    }
  }, []);

  const tasaInteresDiaria = 0.015;
  const intereses = Math.round(monto * tasaInteresDiaria * plazo);
  const total = monto + intereses;

  const fechaPago = new Date();
  fechaPago.setDate(fechaPago.getDate() + plazo);
  const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaFormateada = fechaPago.toLocaleDateString('es-CO', opcionesFecha);

  const handleTumipay = () => {
    window.location.href = `https://checkout.tumipay.com?amount=${total}&phone=3001234567`;
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(to bottom, #F9F9F9, #ECECEC)',
        px: 2,
      }}
    >
  <TopBar />
      <Paper
        elevation={6}
        sx={{
          maxWidth: 500,
          width: '100%',
          p: 5,
          borderRadius: 4,
          textAlign: 'center',
          bgcolor: '#fff',
        }}
      >
        <Typography variant="h4" color="#B00020" fontWeight="bold" gutterBottom>
          Resumen de tu crédito
        </Typography>

        <Typography variant="body1" sx={{ mt: 2 }}>
          💰 <strong>Monto solicitado:</strong> ${monto.toLocaleString()}
        </Typography>

        <Typography variant="body1" sx={{ mt: 1 }}>
          📆 <strong>Plazo:</strong> {plazo} días
        </Typography>

        <Typography variant="body1" sx={{ mt: 1 }}>
          📈 <strong>Intereses estimados:</strong> ${intereses.toLocaleString()}
        </Typography>

        <Typography variant="body1" sx={{ mt: 1 }}>
          🧾 <strong>Total a pagar:</strong> ${total.toLocaleString()}
        </Typography>

        <Typography variant="body1" sx={{ mt: 2 }}>
          📅 <strong>Día de pago estimado:</strong> {fechaFormateada}
        </Typography>

        <Typography variant="h6" color="success.main" sx={{ mt: 4 }}>
          ✅ Tu perfil ha sido validado. Puedes continuar con el pago.
        </Typography>

        <Button
          variant="contained"
          fullWidth
          sx={{
            mt: 3,
            py: 1.5,
            fontWeight: 'bold',
            fontSize: '1rem',
            bgcolor: '#B00020',
            '&:hover': { bgcolor: '#900018' },
          }}
          onClick={handleTumipay}
        >
          Pagar con Tumipay
        </Button>
      </Paper>
    </Box>
  );
}
