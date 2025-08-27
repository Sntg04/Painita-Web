import Webcam from 'react-webcam';
import { Typography, Button, Box } from '@mui/material';
import FormularioContainer from './FormularioContainer';
import { useState, useRef } from 'react';

function Step7_ConfirmacionFinal({ setFormData, onSubmit, onPrev }) {
  const [selfie, setSelfie] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [preview, setPreview] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const webcamRef = useRef(null);

  const selfieCargada = Boolean(selfie);

  const captureSelfie = () => {
    if (attempts < 2) {
      const imageSrc = webcamRef.current.getScreenshot();
      setPreview(imageSrc);
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
          setSelfie(file);
          setShowWebcam(false);
          setAttempts(a => a + 1);
        });
    } else {
      // Tercer intento: captura y envía automáticamente
      const imageSrc = webcamRef.current.getScreenshot();
      setPreview(imageSrc);
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
          setSelfie(file);
          setShowWebcam(false);
          setAttempts(a => a + 1);
          setFormData(prev => ({ ...prev, selfie: file }));
          localStorage.setItem('formularioCompleto', 'true');
          onSubmit();
        });
    }
  };

  const handleSubmit = () => {
    setFormData(prev => ({ ...prev, selfie }));
    localStorage.setItem('formularioCompleto', 'true');
    onSubmit();
  };

  return (
    <FormularioContainer>
      <Typography variant="h5" gutterBottom color="primary" sx={{ fontFamily: 'Montserrat', fontWeight: 700, letterSpacing: 1 }}>
        📷 Verificación Final
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.primary', fontFamily: 'Montserrat' }}>
        Tómate una foto clara de tu rostro en tiempo real.
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.primary', mt: 1, fontFamily: 'Montserrat', fontWeight: 700 }}>
        Recomendaciones para validar tu identidad:
      </Typography>
      <Box component="ul" sx={{ m: '8px 0', pl: 2.5, color: '#B00020', fontSize: '0.95rem', fontFamily: 'Montserrat' }}>
        <li>Sin gorras, sombreros ni gafas.</li>
        <li>Buena iluminación y fondo neutro.</li>
        <li>Rostro completo y sin objetos que lo tapen.</li>
        <li>Evita filtros o retoques.</li>
      </Box>
      <Typography variant="body2" sx={{ color: 'text.primary', mb: 3, fontFamily: 'Montserrat' }}>
        Esta selfie nos ayuda a validar tu identidad y proteger tu crédito.
      </Typography>

      <Box display="flex" flexDirection="column" alignItems="center">
        {onPrev && (
          <Button
            variant="outlined"
            color="primary"
            sx={{ mb: 2, fontWeight: 'bold', borderColor: 'primary.main', color: 'primary.main', fontFamily: 'Montserrat', '&:hover': { borderColor: '#900018', color: '#900018' } }}
            onClick={onPrev}
          >
            Anterior
          </Button>
        )}
        {!showWebcam && attempts < 3 && (
          <Button
            variant="outlined"
            color="primary"
            sx={{ mb: 3, py: 1.2, px: 3, fontWeight: 'bold', borderColor: 'primary.main', color: 'primary.main', fontFamily: 'Montserrat', '&:hover': { borderColor: '#900018', color: '#900018' } }}
            onClick={() => setShowWebcam(true)}
          >
            {selfie ? 'Volver a tomar selfie' : 'Tomar Selfie'}
          </Button>
        )}
        {showWebcam && attempts < 3 && (
          <Box mb={2}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={320}
              height={240}
            />
            <Button variant="contained" color="primary" sx={{ mt: 1, fontFamily: 'Montserrat', fontWeight: 'bold' }} onClick={captureSelfie}>Capturar</Button>
            <Button variant="text" sx={{ mt: 1, ml: 2, fontFamily: 'Montserrat', color: 'primary.main' }} onClick={() => setShowWebcam(false)}>Cancelar</Button>
          </Box>
        )}
        {preview && (
          <Box mb={2}>
            <img src={preview} alt="Previsualización selfie" style={{ width: 200, borderRadius: 8, border: '2px solid #B00020' }} />
            <Typography variant="body2" sx={{ mt: 1, color: 'primary.main', fontFamily: 'Montserrat' }}>Previsualización antes de enviar.</Typography>
          </Box>
        )}
        {selfie && attempts < 3 && (
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2, py: 1.5, fontWeight: 'bold', fontSize: '1rem', fontFamily: 'Montserrat', bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: '#900018' } }}
            onClick={handleSubmit}
            disabled={!selfieCargada}
          >
            Confirmar y Enviar Solicitud
          </Button>
        )}
        {attempts >= 3 && (
          <Typography variant="body2" sx={{ mt: 2, color: 'error.main', fontFamily: 'Montserrat' }}>Has alcanzado el máximo de intentos. La selfie se ha enviado automáticamente.</Typography>
        )}
      </Box>
    </FormularioContainer>
  );

}
export default Step7_ConfirmacionFinal;
