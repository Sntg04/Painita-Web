import React, { useState } from 'react';
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
  AppBar,
  Toolbar,
} from '@mui/material';
import NavMenu from '../components/ui/NavMenu';
import PasswordSetup from '../components/PasswordSetup';
import LoginModal from '../components/LoginModal';

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
  const [loginOpen, setLoginOpen] = useState(false);

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

  const testimonials = [
    'Me salvó en un momento crítico. La cuota fue un poco alta, pero necesitaba el dinero urgente para pagar una urgencia médica. No me gusta pagar tanto, pero prefiero eso a quedarme sin opciones. Gracias a la app, resolví todo en menos de una hora.',
    'Sí, cobran más que un banco… pero ningún banco te presta en 5 minutos. En mi caso, era eso o perder una oportunidad de trabajo. La app fue rápida y cumplió. Recomiendo usarla con responsabilidad.',
    'Los intereses son elevados, pero cuando uno está en apuros, lo último que quiere es esperar papeles. Esta app me prestó cuando nadie más lo hacía. Vale la pena tenerla instalada. Uno nunca sabe cuándo la va a necesitar.',
    'No es la opción más barata, pero sí es la más rápida. Me gustó que no me pidieron tanto papeleo. Solo hay que tener claro que es un préstamo de emergencia, no para cualquier gasto.',
    'Lo importante es pagar a tiempo. Si uno se organiza, la app es útil. Los costos son altos, sí, pero cuando me quedé sin plata para el arriendo, fue lo único que me respondió. Ahora estoy al día y puedo volver a usarla si lo necesito.',
    'Me pareció costoso al principio, pero después entendí que la rapidez tiene su precio. Me ayudó a salir de una deuda más grave. Ojalá bajen un poco las tarifas con el tiempo, pero mientras tanto, es mejor tener esta app que depender de favores.',
  ];

  const LoginBox = () => (
    <Box
      sx={{
        mt: 3,
        cursor: 'pointer',
        transition: '0.3s',
        '&:hover': { boxShadow: 4, bgcolor: '#FFE5E5' },
      }}
      onClick={() => setLoginOpen(true)}
    >
      <Typography variant="body1" color="#B00020" fontWeight="bold">
        ¿Ya tienes cuenta? <span style={{ textDecoration: 'underline' }}>Iniciar sesión</span>
      </Typography>
    </Box>
  );

  const handleSolicitar = () => {
    localStorage.setItem('painita_plazo', plazo);
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
        setError('No se pudo enviar el código.');
      }
    } catch (err) {
      setError('Error de conexión al enviar el código: ' + (err?.message || ''));
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
        py: 4,
        overflowX: 'hidden',
        background: 'linear-gradient(135deg, #fff 0%, #fbeaec 100%)',
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Ccircle cx='20' cy='20' r='1' fill='%23B00020' fill-opacity='0.07'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'repeat',
      }}
    >
  <NavMenu topOffset={12} />
      {/* AppBar */}
      <AppBar position="fixed" sx={{ bgcolor: '#B00020', boxShadow: 2, zIndex: 1201 }}>
        <Toolbar sx={{ minHeight: 64, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontFamily: 'Playfair Display, serif', color: '#fff', letterSpacing: 2 }}>
            Painita
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Button sx={{ color: '#fff', fontFamily: 'Nunito, Arial, sans-serif', fontWeight: 'bold' }} href="#beneficios">
              Beneficios
            </Button>
            <Button sx={{ color: '#fff', fontFamily: 'Nunito, Arial, sans-serif', fontWeight: 'bold' }} href="#quienes">
              ¿Quiénes somos?
            </Button>
            <Button sx={{ color: '#fff', fontFamily: 'Nunito, Arial, sans-serif', fontWeight: 'bold' }} href="#opiniones">
              Opiniones
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: isCelular ? 'center' : 'flex-start',
          mt: isCelular ? 0 : { xs: 10, md: 12 },
          mb: isCelular ? 0 : 6,
          minHeight: isCelular ? 'calc(100vh - 64px)' : 'auto',
          px: { xs: 0, md: 0 },
          width: '100%',
          maxWidth: '100vw',
          boxSizing: 'border-box',
        }}
      >
        <Grow in timeout={800}>
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
            {fase === 'calculadora' && (
              <>
                <Fade in timeout={1200}>
                  <Typography
                    variant="h4"
                    sx={{ color: '#B00020', fontWeight: 'bold', fontFamily: 'Playfair Display, serif', letterSpacing: 1, mb: 2, fontSize: { xs: '1.3rem', md: '2rem' } }}
                    gutterBottom
                  >
                    Calcula tu crédito
                  </Typography>
                </Fade>
                <Fade in timeout={1500}>
                  <Typography variant="h6" sx={{ color: '#000000', fontFamily: 'Nunito, Arial, sans-serif' }} mb={4}>
                    Tu plataforma de préstamos instantáneos
                  </Typography>
                </Fade>
              </>
            )}

            {fase === 'calculadora' && (
              <>
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
                    mb: 2,
                    color: '#B00020',
                    '& .MuiSlider-thumb': { bgcolor: '#B00020' },
                    '& .MuiSlider-track': { bgcolor: '#B00020' },
                    '& .MuiSlider-rail': { bgcolor: '#fbeaec' },
                  }}
                />
                <Typography variant="body1" mb={3} sx={{ color: '#000000', fontFamily: 'Nunito, Arial, sans-serif' }}>
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
                    mb: 2,
                    color: '#B00020',
                    '& .MuiSlider-thumb': { bgcolor: '#B00020' },
                    '& .MuiSlider-track': { bgcolor: '#B00020' },
                    '& .MuiSlider-rail': { bgcolor: '#fbeaec' },
                  }}
                />
                <Typography variant="body1" mb={3} sx={{ color: '#000000', fontFamily: 'Nunito, Arial, sans-serif' }}>
                  Plazo seleccionado: <strong style={{ color: '#B00020', fontFamily: 'Nunito, Arial, sans-serif' }}>{plazo} días</strong>
                </Typography>

                {/* Desglose de costos */}
                <Box sx={{
                  textAlign: 'left',
                  border: '1px solid rgba(176,0,32,0.15)',
                  borderRadius: 2,
                  p: 2,
                  mb: 3,
                  bgcolor: '#fff8f8'
                }}>
                  <Typography variant="subtitle1" sx={{ color: '#B00020', fontWeight: 'bold', mb: 1 }}>
                    Desglose del crédito
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Valor solicitado</Typography>
                    <Typography variant="body2" fontWeight="bold">{formatCurrency(monto)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Interés (23% E.A.)</Typography>
                    <Typography variant="body2" fontWeight="bold">{formatCurrency(interesEA)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Seguro</Typography>
                    <Typography variant="body2" fontWeight="bold">{formatCurrency(seguro)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Fianza FGA + IVA</Typography>
                    <Typography variant="body2" fontWeight="bold">{formatCurrency(fianza)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Administración</Typography>
                    <Typography variant="body2" fontWeight="bold">{formatCurrency(administracion)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">IVA</Typography>
                    <Typography variant="body2" fontWeight="bold">{formatCurrency(ivaAdministracion)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(176,0,32,0.3)', pt: 1, mt: 1 }}>
                    <Typography variant="body1" fontWeight="bold">Total a pagar</Typography>
                    <Typography variant="body1" fontWeight="bold" color="#B00020">{formatCurrency(totalPagar)}</Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    py: 1.5,
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

                <LoginBox />
                <LoginModal
                  open={loginOpen}
                  onClose={() => setLoginOpen(false)}
                  onLoginSuccess={() => navigate('/dashboard', { state: { monto, plazo } })}
                />
              </>
            )}

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
        </Grow>
      </Box>

      {/* Sección institucional: visible solo en la fase de calculadora */}
      {fase === 'calculadora' && (
        <Box id="quienes" sx={{ display: 'flex', justifyContent: 'center', mb: 6, px: { xs: 0, md: 0 }, width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
          <Fade in timeout={1200}>
            <Box
              sx={{
                px: { xs: 1, md: 2 },
                py: { xs: 2, md: 4 },
                bgcolor: '#FFF3F3',
                borderRadius: 4,
                boxShadow: 3,
                maxWidth: '100%',
                mx: 'auto',
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
            >
              <Typography variant="h4" sx={{ color: '#B00020', fontWeight: 'bold', fontFamily: 'Playfair Display, serif', letterSpacing: 1 }} gutterBottom>
                ¿Quiénes somos?
              </Typography>
              <Typography variant="body1" sx={{ color: '#000000', fontFamily: 'Nunito, Arial, sans-serif', opacity: 0.95 }} mb={3}>
                En Painita creemos que el acceso al crédito debe ser tan valioso como la piedra que nos inspira. Somos una plataforma colombiana que transforma la forma en que las personas acceden a préstamos: con rapidez, transparencia y una experiencia emocionalmente premium.
              </Typography>
              <Typography variant="h5" sx={{ color: '#B00020', fontWeight: 'bold', fontFamily: 'Playfair Display, serif', letterSpacing: 1 }} gutterBottom>
                Nuestra misión
              </Typography>
              <Typography variant="body1" sx={{ color: '#000000', fontFamily: 'Nunito, Arial, sans-serif', opacity: 0.95 }} mb={3}>
                Democratizar el acceso al crédito instantáneo en Colombia, ofreciendo una experiencia digital que combine confianza, elegancia y eficiencia. Cada paso, desde el onboarding hasta el pago, está diseñado para que el usuario se sienta valorado.
              </Typography>
              <Typography variant="h5" sx={{ color: '#B00020', fontWeight: 'bold', fontFamily: 'Playfair Display, serif', letterSpacing: 1 }} gutterBottom>
                Nuestra visión
              </Typography>
              <Typography variant="body1" sx={{ color: '#000000', fontFamily: 'Nunito, Arial, sans-serif', opacity: 0.95 }} mb={3}>
                Ser reconocidos como la plataforma de crédito más confiable y emocionalmente conectada del país. Así como la Painita es una de las gemas más raras del mundo, queremos que cada usuario sienta que ha encontrado algo único.
              </Typography>
              <Typography variant="h5" sx={{ color: '#B00020', fontWeight: 'bold', fontFamily: 'Playfair Display, serif', letterSpacing: 1 }} gutterBottom>
                ¿Por qué Painita?
              </Typography>
              <Typography variant="body1" sx={{ color: '#000000', fontFamily: 'Nunito, Arial, sans-serif', opacity: 0.95 }}>
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

              {/* Opiniones */}
              <Box id="opiniones" sx={{ mt: 8, mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
            </Box>
          </Fade>
        </Box>
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
