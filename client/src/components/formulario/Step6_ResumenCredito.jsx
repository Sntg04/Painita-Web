'use client';

import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import {
  Button,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import FormularioContainer from './FormularioContainer';

export default function Step6_ResumenCredito({ onNext, onPrev }) {
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [showWebcamFront, setShowWebcamFront] = useState(false);
  const [showWebcamBack, setShowWebcamBack] = useState(false);
  const webcamRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.name === 'id_front') setIdFront(e.target.files[0]);
    if (e.target.name === 'id_back') setIdBack(e.target.files[0]);
  };

  // Captura foto y la convierte en archivo para subir
  const capturePhoto = (type) => {
    const imageSrc = webcamRef.current.getScreenshot();
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `${type}_photo.jpg`, { type: 'image/jpeg' });
        if (type === 'id_front') setIdFront(file);
        if (type === 'id_back') setIdBack(file);
        setShowWebcamFront(false);
        setShowWebcamBack(false);
      });
  };

  const ambosDocumentosCargados = idFront && idBack;

  const handleNextStep = async () => {
    // Enviar imágenes al backend
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
    const dbId = localStorage.getItem('formularioDbId');
    const user_id = localStorage.getItem('user_id');
    const formDataToSend = new FormData();
    formDataToSend.append('id_front', idFront);
    formDataToSend.append('id_back', idBack);
    formDataToSend.append('user_id', user_id);
    formDataToSend.append('formulario_id', dbId);
    // Puedes agregar más datos si lo necesitas

    try {
      const res = await fetch(`${API_BASE_URL}/formulario/upload-docs`, {
        method: 'POST',
        body: formDataToSend,
      });
      if (res.ok) {
        console.log('✅ Imágenes subidas correctamente');
        onNext();
      } else {
        console.warn('⚠️ Error al subir imágenes');
      }
    } catch (error) {
      console.error('❌ Fallo al subir imágenes:', error);
    }
  };

  return (
    <FormularioContainer>
      <Typography variant="h5" gutterBottom color="primary" sx={{ fontFamily: 'Montserrat', fontWeight: 700, letterSpacing: 1 }}>
        🪪 Documento de Identidad
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.primary', mb: 3, fontFamily: 'Montserrat' }}>
        Puedes tomar una foto o seleccionar un archivo. Asegúrate de que sea legible y sin reflejos.
      </Typography>

      <Box display="flex" flexDirection="column" alignItems="center">
        {/* Subir o tomar foto del frente */}
        <Button
          variant="outlined"
          color="primary"
          component="label"
          sx={{ mb: 2, py: 1.2, px: 3, fontWeight: 'bold', borderColor: 'primary.main', color: 'primary.main', fontFamily: 'Montserrat', '&:hover': { borderColor: '#900018', color: '#900018' } }}
        >
          {idFront ? idFront.name : 'Subir Cédula (Frente)'}
          <input
            type="file"
            name="id_front"
            hidden
            accept="image/*,.pdf"
            onChange={handleFileChange}
          />
        </Button>
        <Button
          variant="outlined"
          color="primary"
          sx={{ mb: 2, fontWeight: 'bold', borderColor: 'primary.main', color: 'primary.main', fontFamily: 'Montserrat', '&:hover': { borderColor: '#900018', color: '#900018' } }}
          onClick={() => setShowWebcamFront(true)}
        >
          Tomar foto (Frente)
        </Button>
        {showWebcamFront && (
          <Box mb={2}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={320}
              height={240}
            />
            <Button variant="contained" color="primary" sx={{ mt: 1, fontFamily: 'Montserrat', fontWeight: 'bold' }} onClick={() => capturePhoto('id_front')}>Capturar</Button>
            <Button variant="text" sx={{ mt: 1, ml: 2, fontFamily: 'Montserrat', color: 'primary.main' }} onClick={() => setShowWebcamFront(false)}>Cancelar</Button>
          </Box>
        )}

        {/* Subir o tomar foto del reverso */}
        <Button
          variant="outlined"
          color="primary"
          component="label"
          sx={{ mb: 2, py: 1.2, px: 3, fontWeight: 'bold', borderColor: 'primary.main', color: 'primary.main', fontFamily: 'Montserrat', '&:hover': { borderColor: '#900018', color: '#900018' } }}
        >
          {idBack ? idBack.name : 'Subir Cédula (Reverso)'}
          <input
            type="file"
            name="id_back"
            hidden
            accept="image/*,.pdf"
            onChange={handleFileChange}
          />
        </Button>
        <Button
          variant="outlined"
          color="primary"
          sx={{ mb: 2, fontWeight: 'bold', borderColor: 'primary.main', color: 'primary.main', fontFamily: 'Montserrat', '&:hover': { borderColor: '#900018', color: '#900018' } }}
          onClick={() => setShowWebcamBack(true)}
        >
          Tomar foto (Reverso)
        </Button>
        {showWebcamBack && (
          <Box mb={2}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={320}
              height={240}
            />
            <Button variant="contained" color="primary" sx={{ mt: 1, fontFamily: 'Montserrat', fontWeight: 'bold' }} onClick={() => capturePhoto('id_back')}>Capturar</Button>
            <Button variant="text" sx={{ mt: 1, ml: 2, fontFamily: 'Montserrat', color: 'primary.main' }} onClick={() => setShowWebcamBack(false)}>Cancelar</Button>
          </Box>
        )}

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
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2, py: 1.5, fontWeight: 'bold', fontSize: '1rem', fontFamily: 'Montserrat', bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: '#900018' } }}
          onClick={handleNextStep}
          disabled={!ambosDocumentosCargados}
        >
          Siguiente
        </Button>
      </Box>
    </FormularioContainer>
  );
}
