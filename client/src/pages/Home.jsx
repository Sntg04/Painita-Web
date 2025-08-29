import React, { useState, useEffect } from 'react';
import { sendOTP as apiSendOTP, verifyOTP as apiVerifyOTP } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Slider,
  Paper,
  Button,
  TextField,
  Card,
  CardContent,
  Fade,
  Grow,
  Zoom,
} from '@mui/material';
import TopBar from '../components/ui/TopBar';
import PasswordSetup from '../components/PasswordSetup';
// Eliminado LoginModal local; el acceso a login queda en la TopBar

export default function Home() {
  const navigate = useNavigate();
  const [monto, setMonto] = useState(300000);
  const [plazo, setPlazo] = useState(30);
  const [fase, setFase] = useState('calculadora');
  const isCelular = fase === 'celular';
  const [celular, setCelular] = useState('');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [devOtp, setDevOtp] = useState('');
  // Eliminado estado de login modal local
  const [heroIn, setHeroIn] = useState(false);
  const [contentIn, setContentIn] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setHeroIn(true), 200);
    const t2 = setTimeout(() => setContentIn(true), 1000); // aparece después del hero
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Tasas y utilidades
  const EA = 0.23; // 23% E.A
  const seguroRate = 0.00449; // 0,449%
  // Fianza por tramos (Tarifa_base):
  //  <= 200.000 -> 14%
  //  <= 300.000 -> 12%
  //  <= 400.000 -> 11%
  //  >  400.000 -> 10,59%
  const getTarifaBaseFianza = (capital) => {
    if (capital <= 200000) return 0.14;
    if (capital <= 300000) return 0.12;
    if (capital <= 400000) return 0.11;
    return 0.1059;
  };
  const ADMIN_FIJO = 33000; // Administración fija
  const ivaRate = 0.19; // 19% sobre administración

  const formatCurrency = (value) =>
    (value ?? 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

  // Interés por días con tasa E.A.: monto * ((1+EA)^(plazo/365) - 1)
  const interesEA = monto * (Math.pow(1 + EA, plazo / 365) - 1);
  const seguro = monto * seguroRate;
  const tarifaBaseFianza = getTarifaBaseFianza(monto);
  const fianza = monto * tarifaBaseFianza * 1.19; // incluye IVA de fianza
  const administracion = ADMIN_FIJO;
  const ivaAdministracion = administracion * ivaRate;
  const totalPagar = monto + interesEA + seguro + fianza + administracion + ivaAdministracion;

  // Opiniones utilizadas en la sección institucional
  const testimonials = [
    'Me ayudó en un momento urgente. Todo fue rápido y claro.',
    'La experiencia fue sencilla. Útil cuando necesitas liquidez al instante.',
    'El proceso fue transparente y sin tanta traba.',
    'Respuesta ágil y buen acompañamiento durante el proceso.',
  ];

  // UI helpers y handlers faltantes
  // Eliminado LoginBox (link de iniciar sesión dentro de la tarjeta)

  const handleSolicitar = () => {
    try { localStorage.setItem('painita_plazo', String(plazo)); } catch {}
    setFase('celular');
    setError('');
    setMensaje('');
  };

  const handleCelularChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCelular(value.slice(0, 10));
    setError('');
  };

  const handleCodigoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCodigo(value.slice(0, 6));
    setError('');
  };

  const handleContinuar = async () => {
    if (celular.length !== 10) {
      setError('Ingresa un número válido de 10 dígitos');
      return;
    }
    setError('');
    try {
      const response = await apiSendOTP(celular);
      if (response.data.success) {
        setMensaje('Código enviado al celular');
        setDevOtp(response.data?.dev_otp || '');
      } else {
        setError(response?.data?.error || 'No se pudo enviar el código.');
        setDevOtp(response?.data?.dev_otp || '');
      }
    } catch (err) {
      const serverMsg = err?.response?.data?.error;
      const dev = err?.response?.data?.dev_otp;
      if (serverMsg) setError(serverMsg);
      else setError('Error de conexión al enviar el código: ' + (err?.message || ''));
      if (dev) setDevOtp(dev);
    }
  };

  const handleVerificar = async () => {
    if (codigo.length !== 6) {
      setError('Ingresa un código válido de 6 dígitos');
      return;
    }
    setError('');
    try {
      const response = await apiVerifyOTP(celular, codigo);
      if (response.data.verified) {
        setFase('password');
      } else {
        setError('Código incorrecto o expirado.');
      }
    } catch (err) {
      setError('Error de conexión al verificar el código: ' + (err?.message || ''));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        px: { xs: 0, md: 0 },
  py: 0,
        overflowX: 'hidden',
        background: 'linear-gradient(135deg, #fff 0%, #fbeaec 100%)',
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Ccircle cx='20' cy='20' r='1' fill='%23B00020' fill-opacity='0.07'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'repeat',
      }}
    >
      <TopBar />

      {/* Hero message */}
      <Zoom in={heroIn} timeout={650}>
        <Box sx={{ mt: { xs: 9, md: 12 }, mb: { xs: 0, md: 0.5 }, px: { xs: 1.5, md: 2 }, textAlign: 'center', maxWidth: '100%' }}>
          <Typography
            sx={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 800,
              color: '#B00020',
              letterSpacing: { xs: 0.25, md: 0.35 },
              fontSize: { xs: 'clamp(1.15rem, 4.8vw + 0.2rem, 1.7rem)', md: 'clamp(1.6rem, 1.8vw + 0.6rem, 2.3rem)' },
              textShadow: '0 2px 12px rgba(176,0,32,0.15)',
              lineHeight: 1.12,
            }}
          >
            Painita, una ayuda financiera
          </Typography>
          <Typography
            sx={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 800,
              color: '#B00020',
              letterSpacing: { xs: 0.25, md: 0.35 },
              fontSize: { xs: 'clamp(1.15rem, 4.8vw + 0.2rem, 1.7rem)', md: 'clamp(1.6rem, 1.8vw + 0.6rem, 2.3rem)' },
              textShadow: '0 2px 10px rgba(176,0,32,0.12)',
              lineHeight: 1.12,
            }}
          >
            tan valiosa como una gema.
          </Typography>
          <Box sx={{ width: 120, height: 4, bgcolor: '#B00020', borderRadius: 2, mx: 'auto', mt: 1 }} />
        </Box>
      </Zoom>

      {/* Main content */}
    <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: isCelular ? 'center' : 'flex-start',
      mt: isCelular ? 0 : { xs: 4, md: 6 },
      mb: 0,
          minHeight: isCelular ? 'calc(100vh - 64px)' : 'auto',
          px: { xs: 0, md: 0 },
          width: '100%',
          maxWidth: '100vw',
          boxSizing: 'border-box',
        }}
      >
        <Grow in={contentIn} timeout={800}>
          {fase === 'calculadora' ? (
      <Paper
              elevation={6}
              sx={{
                maxWidth: { xs: '100%', sm: 520, md: 920 },
                width: '100%',
        p: { xs: 1, md: 2 },
                borderRadius: 4,
                bgcolor: '#FFFFFF',
                boxShadow: '0 8px 32px rgba(176,0,32,0.08)',
                boxSizing: 'border-box',
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 3 }, alignItems: { xs: 'stretch', md: 'stretch' }, flex: 1 }}>
                {/* Left: Calculator */}
        <Paper elevation={0} sx={{ flex: 1, p: { xs: 0.5, md: 1 }, bgcolor: 'transparent', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <Fade in timeout={1200}>
                    <Typography
                      variant="h4"
                      sx={{
                        color: '#B00020',
                        fontWeight: 900,
                        fontFamily: 'Playfair Display, serif',
                        letterSpacing: 1,
                        mb: 1.1,
                        fontSize: { xs: '1.3rem', md: '2rem' },
                        WebkitTextStroke: '0.4px #B00020',
                        paintOrder: 'stroke fill',
                        textShadow: '0 0 0.6px rgba(176,0,32,0.45)'
                      }}
                      gutterBottom
                    >
                      Calcula tu crédito
                    </Typography>
                  </Fade>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.1, md: 2.2 }, pt: { xs: 0.18, md: 0.5 } }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#B00020', fontFamily: 'Playfair Display, serif' }}>
                    ¿Cuánto necesitas?
                  </Typography>
                  <Slider
                    value={monto}
                    min={100000}
                    max={1200000}
                    step={10000}
                    onChange={(e, val) => setMonto(val)}
                    valueLabelDisplay="auto"
                    sx={{
                      mb: 1.1,
                      color: '#B00020',
                      '& .MuiSlider-thumb': { bgcolor: '#B00020' },
                      '& .MuiSlider-track': { bgcolor: '#B00020' },
                      '& .MuiSlider-rail': { bgcolor: '#fbeaec' },
                    }}
                  />
                  <Typography variant="body1" mb={1.9} sx={{ color: '#000000', fontFamily: 'Nunito, Arial, sans-serif' }}>
                    Monto seleccionado: <strong style={{ color: '#B00020', fontFamily: 'Nunito, Arial, sans-serif' }}>${monto.toLocaleString()}</strong>
                  </Typography>

                  <Typography variant="h6" gutterBottom sx={{ color: '#B00020', fontFamily: 'Playfair Display, serif' }}>
                    ¿En cuántos días?
                  </Typography>
                  <Slider
                    value={plazo}
                    min={8}
                    max={120}
                    step={1}
                    onChange={(e, val) => setPlazo(val)}
                    valueLabelDisplay="auto"
                    sx={{
                      mb: 1.1,
                      color: '#B00020',
                      '& .MuiSlider-thumb': { bgcolor: '#B00020' },
                      '& .MuiSlider-track': { bgcolor: '#B00020' },
                      '& .MuiSlider-rail': { bgcolor: '#fbeaec' },
                    }}
                  />
                  <Typography variant="body1" mb={1.9} sx={{ color: '#000000', fontFamily: 'Nunito, Arial, sans-serif' }}>
                    Plazo seleccionado: <strong style={{ color: '#B00020', fontFamily: 'Nunito, Arial, sans-serif' }}>{plazo} días</strong>
                  </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      py: 1,
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      backgroundColor: '#B00020',
                      color: '#FFFFFF',
                      fontFamily: 'Nunito, Arial, sans-serif',
                      boxShadow: '0 4px 16px rgba(176,0,32,0.15)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        backgroundColor: '#900018',
                        transform: 'scale(1.04)',
                        boxShadow: '0 8px 32px rgba(176,0,32,0.25)',
                      },
                    }}
                    onClick={handleSolicitar}
                  >
                    Solicitar Crédito
                  </Button>

                </Paper>

                {/* Right: Breakdown panel */}
                <Paper elevation={0} sx={{ flex: 1, p: { xs: 1.1, md: 2 }, pt: { xs: 0.5, md: 1 }, bgcolor: '#B00020', color: '#FFFFFF', borderRadius: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Typography
                    variant="h4"
                    sx={{
                      fontFamily: 'Playfair Display, serif',
                      fontWeight: 900,
                      letterSpacing: 1,
            mb: 0.9,
                      fontSize: { xs: '1.3rem', md: '2rem' },
            textAlign: 'center',
                    }}
                  >
                    Desglose del crédito
                  </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, lineHeight: { xs: 1.15, md: 1.2 } }}>Valor solicitado</Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, lineHeight: { xs: 1.15, md: 1.2 } }}>{formatCurrency(monto)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, lineHeight: { xs: 1.15, md: 1.2 } }}>Interés (23% E.A.)</Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, lineHeight: { xs: 1.15, md: 1.2 } }}>{formatCurrency(interesEA)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, lineHeight: { xs: 1.15, md: 1.2 } }}>Seguro</Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, lineHeight: { xs: 1.15, md: 1.2 } }}>{formatCurrency(seguro)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, lineHeight: { xs: 1.15, md: 1.2 } }}>Fianza FGA + IVA</Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, lineHeight: { xs: 1.15, md: 1.2 } }}>{formatCurrency(fianza)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, lineHeight: { xs: 1.15, md: 1.2 } }}>Administración</Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, lineHeight: { xs: 1.15, md: 1.2 } }}>{formatCurrency(administracion)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, lineHeight: { xs: 1.15, md: 1.2 } }}>IVA</Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, lineHeight: { xs: 1.15, md: 1.2 } }}>{formatCurrency(ivaAdministracion)}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 0.6, borderTop: '1px dashed rgba(255,255,255,0.45)' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: { xs: '1.2rem', md: '1.3rem' } }}>Total a pagar</Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#FFE5E5', fontSize: { xs: '1.2rem', md: '1.3rem' }, lineHeight: { xs: 1.15, md: 1.2 } }}>{formatCurrency(totalPagar)}</Typography>
                  </Box>
                </Paper>
              </Box>
            </Paper>
          ) : (
            <Paper
              elevation={6}
              sx={{
                maxWidth: isCelular ? 420 : { xs: 340, sm: 400, md: 480 },
                width: '100%',
                p: isCelular ? { xs: 2.5, md: 4 } : { xs: 2, md: 5 },
                borderRadius: 4,
                textAlign: 'center',
                bgcolor: '#FFFFFF',
                boxShadow: '0 8px 32px rgba(176,0,32,0.08)',
                boxSizing: 'border-box',
                mx: 'auto',
              }}
            >
              {fase === 'celular' && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ color: '#B00020', fontFamily: 'Playfair Display, serif' }}>
                    Ingresa tu número de celular
                  </Typography>
                  <TextField
                    fullWidth
                    label="Celular"
                    value={celular}
                    onChange={handleCelularChange}
                    error={!!error}
                    helperText={error}
                    inputProps={{ maxLength: 10 }}
                    margin="normal"
                    sx={{
                      '& .MuiInputBase-root': { color: '#B00020' },
                      '& label': { color: '#B00020' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#B00020' },
                      '& .MuiFormHelperText-root': { color: '#B00020' },
                    }}
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2, py: 1.2, fontWeight: 'bold', backgroundColor: '#B00020', color: '#fff', '&:hover': { backgroundColor: '#900018' } }}
                    onClick={handleContinuar}
                  >
                    Enviar código
                  </Button>

                  {mensaje && (
                    <>
                      <Typography variant="body2" sx={{ color: '#B00020', fontFamily: 'Nunito, Arial, sans-serif' }} mt={3}>
                        {mensaje}
                      </Typography>
                      {devOtp && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 1 }} color="text.secondary">
                          Código de prueba (local): {devOtp}{' '}
                          <Button size="small" onClick={() => setCodigo(String(devOtp))}>Pegar código</Button>
                        </Typography>
                      )}
                      <TextField
                        fullWidth
                        label="Código OTP"
                        value={codigo}
                        onChange={handleCodigoChange}
                        error={!!error}
                        helperText={error}
                        inputProps={{ maxLength: 6 }}
                        margin="normal"
                        sx={{ mt: 2, '& .MuiInputBase-root': { color: '#B00020' }, '& label': { color: '#B00020' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#B00020' }, '& .MuiFormHelperText-root': { color: '#B00020' } }}
                      />
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{ mt: 2, py: 1.2, fontWeight: 'bold', backgroundColor: '#B00020', color: '#fff', '&:hover': { backgroundColor: '#900018' } }}
                        onClick={handleVerificar}
                      >
                        Verificar código
                      </Button>
                    </>
                  )}
                </>
              )}

              {fase === 'password' && <PasswordSetup phone={celular} monto={monto} plazo={plazo} />}

              {fase === 'final' && (
                <Typography variant="h6" sx={{ color: '#B00020', fontFamily: 'Playfair Display, serif' }} mt={4}>
                  🎉 Cuenta creada exitosamente. Puedes continuar al pago.
                </Typography>
              )}
            </Paper>
          )}
        </Grow>
  </Box>

      {/* Sección institucional + opiniones: visibles en calculadora, pero en contenedores separados */}
      {fase === 'calculadora' && (
        <>
          <Box id="quienes" sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 0,
            px: { xs: 0, md: 0 },
            width: '100dvw',
            maxWidth: 'none',
            boxSizing: 'border-box',
            bgcolor: '#B00020',
            alignSelf: 'stretch',
            marginLeft: 'calc(50% - 50dvw)',
            marginRight: 'calc(50% - 50dvw)'
          }}>
            <Fade in timeout={1200}>
              <Box
                sx={{
                  px: { xs: 1, md: 2 },
                  py: { xs: 1.5, md: 2.5 },
                  maxWidth: '100%',
                  mx: 'auto',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                }}
              >
                <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 'bold', fontFamily: 'Playfair Display, serif', letterSpacing: 1 }} gutterBottom>
                  ¿Quiénes somos?
                </Typography>
                <Typography variant="body1" sx={{ color: '#FFE5E5', fontFamily: 'Nunito, Arial, sans-serif' }} mb={2}>
                  En Painita creemos que el acceso al crédito debe ser tan valioso como la piedra que nos inspira. Somos una plataforma colombiana que transforma la forma en que las personas acceden a préstamos: con rapidez, transparencia y una experiencia emocionalmente premium.
                </Typography>
                {/* Misión y Visión en dos contenedores lado a lado (apilados en móvil) */}
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'stretch', justifyContent: 'center' }}>
                  <Card sx={{ flex: 1, minWidth: { md: 280 }, bgcolor: '#FFFFFF', borderRadius: 3, boxShadow: 3 }}>
                    <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                      <Typography variant="h6" sx={{ color: '#B00020', fontWeight: 'bold', fontFamily: 'Playfair Display, serif', letterSpacing: 0.5 }} gutterBottom>
                        Nuestra misión
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#000000', fontFamily: 'Nunito, Arial, sans-serif', opacity: 0.95 }}>
                        Democratizar el acceso al crédito instantáneo en Colombia, ofreciendo una experiencia digital que combine confianza, elegancia y eficiencia. Cada paso, desde el onboarding hasta el pago, está diseñado para que el usuario se sienta valorado.
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card sx={{ flex: 1, minWidth: { md: 280 }, bgcolor: '#FFFFFF', borderRadius: 3, boxShadow: 3 }}>
                    <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                      <Typography variant="h6" sx={{ color: '#B00020', fontWeight: 'bold', fontFamily: 'Playfair Display, serif', letterSpacing: 0.5 }} gutterBottom>
                        Nuestra visión
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#000000', fontFamily: 'Nunito, Arial, sans-serif', opacity: 0.95 }}>
                        Ser reconocidos como la plataforma de crédito más confiable y emocionalmente conectada del país. Así como la Painita es una de las gemas más raras del mundo, queremos que cada usuario sienta que ha encontrado algo único.
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 'bold', fontFamily: 'Playfair Display, serif', letterSpacing: 1, mt: { xs: 3, md: 4 } }} gutterBottom>
                  ¿Por qué Painita?
                </Typography>
                <Typography variant="body1" sx={{ color: '#FFE5E5', fontFamily: 'Nunito, Arial, sans-serif' }}>
                  La Painita es una piedra preciosa extremadamente rara, descubierta en Myanmar y considerada una de las más valiosas por su escasez y belleza. Elegimos ese nombre porque creemos que el crédito también puede ser una joya: algo que empodera, transforma y brilla cuando se entrega con propósito. En Painita, cada usuario es tratado como lo que es: valioso.
                </Typography>
                {/* Beneficios */}
                <Box sx={{ mt: 6, display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center' }}>
                  <Grow in timeout={1200}>
                    <Card sx={{ minWidth: 220, maxWidth: 260, bgcolor: '#fff', boxShadow: 4, borderRadius: 3, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)', boxShadow: 8 } }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#B00020', fontFamily: 'Playfair Display, serif', mb: 1 }}>Rápido</Typography>
                        <Typography variant="body2" sx={{ color: '#000', fontFamily: 'Nunito, Arial, sans-serif' }}>Obtén tu préstamo en minutos, sin trámites largos.</Typography>
                      </CardContent>
                    </Card>
                  </Grow>
                  <Grow in timeout={1400}>
                    <Card sx={{ minWidth: 220, maxWidth: 260, bgcolor: '#fff', boxShadow: 4, borderRadius: 3, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)', boxShadow: 8 } }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#B00020', fontFamily: 'Playfair Display, serif', mb: 1 }}>Seguro</Typography>
                        <Typography variant="body2" sx={{ color: '#000', fontFamily: 'Nunito, Arial, sans-serif' }}>Tus datos y tu dinero siempre protegidos.</Typography>
                      </CardContent>
                    </Card>
                  </Grow>
                  <Grow in timeout={1600}>
                    <Card sx={{ minWidth: 220, maxWidth: 260, bgcolor: '#fff', boxShadow: 4, borderRadius: 3, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)', boxShadow: 8 } }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#B00020', fontFamily: 'Playfair Display, serif', mb: 1 }}>Emocional</Typography>
                        <Typography variant="body2" sx={{ color: '#000', fontFamily: 'Nunito, Arial, sans-serif' }}>Una experiencia premium, pensada para ti.</Typography>
                      </CardContent>
                    </Card>
                  </Grow>
                </Box>
              </Box>
            </Fade>
          </Box>

          {/* Opiniones en contenedor independiente */}
          <Box id="opiniones" sx={{ display: 'flex', justifyContent: 'center', mb: 6, px: { xs: 0, md: 0 }, width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
            <Fade in timeout={1200}>
              <Box sx={{ px: { xs: 1, md: 2 }, py: { xs: 2, md: 4 }, bgcolor: '#FFFFFF', borderRadius: 4, boxShadow: 3, maxWidth: '100%', mx: 'auto', textAlign: 'center', boxSizing: 'border-box' }}>
                <Typography variant="h4" sx={{ color: '#B00020', fontFamily: 'Playfair Display, serif', mb: 4 }} gutterBottom>
                  Opiniones de nuestros clientes
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
                  {testimonials.map((opinion, idx) => (
                    <Grow in timeout={1800 + idx * 200} key={idx}>
                      <Card sx={{ maxWidth: 340, minWidth: 260, bgcolor: '#fff', boxShadow: 4, borderRadius: 3, p: 2, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.04)', boxShadow: 8 } }}>
                        <CardContent>
                          <Typography variant="body2" sx={{ color: '#000', fontFamily: 'Nunito, Arial, sans-serif', fontStyle: 'italic', mb: 2 }}>
                            “{opinion}”
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grow>
                  ))}
                </Box>
              </Box>
            </Fade>
          </Box>
        </>
      )}

      {/* SVG decorativo */}
      <Box sx={{ position: 'fixed', right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}>
        <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="140" cy="140" r="40" fill="#B00020" fillOpacity="0.08" />
          <circle cx="100" cy="160" r="20" fill="#B00020" fillOpacity="0.12" />
        </svg>
      </Box>
    </Box>
  );
}
