import React from 'react';
import { useState } from 'react';
// import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useSyncFormulario from '@/hooks/useSyncFormulario';

import Step1_PersonalInfo from '@/components/formulario/Step1_PersonalInfo';
import Step2_Contacto from '@/components/formulario/Step2_Contacto';
import Step3_ActividadEconomica from '@/components/formulario/Step3_ActividadEconomica';
import Step4_Referencias from '@/components/formulario/Step4_Referencias';
import Step5_Bancarios from '@/components/formulario/Step5_Bancarios';
import Step6_ResumenCredito from '@/components/formulario/Step6_ResumenCredito';
import Step7_ConfirmacionFinal from '@/components/formulario/Step7_ConfirmacionFinal';


const Formulario = () => {
  // Limpia localStorage al cargar la página (nueva sesión)
  useEffect(() => {
    localStorage.removeItem('formularioId');
    localStorage.removeItem('formularioDbId');
    // Recupera datos de la URL y los guarda en localStorage
    const params = new URLSearchParams(window.location.search);
    const user_id = params.get('user_id');
    const celular = params.get('celular');
    if (user_id) localStorage.setItem('user_id', user_id);
    if (celular) localStorage.setItem('celular', celular);
    // monto y plazo se recuperan solo de localStorage unificado
  }, []);

  // Recupera datos de localStorage si existen
  const celular = localStorage.getItem('celular') || '';
  const monto = localStorage.getItem('painita_monto') || '';
  const plazo = localStorage.getItem('painita_plazo') || '';
  // Consulta el backend para saber el paso actual del usuario
  const [pasoActual, setPasoActual] = useState(0);
  useEffect(() => {
    const user_id = localStorage.getItem('user_id');
    if (user_id) {
      fetch(`http://localhost:5000/api/formulario/estado/${user_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.existe && typeof data.paso_actual === 'number') {
            setPasoActual(data.paso_actual);
            if (data.id) localStorage.setItem('formularioDbId', data.id);
          }
        });
    }
  }, []);
  const [formData, setFormData] = useState({ celular, monto, plazo });
  // Estado temporal para los datos del paso actual
  const [stepData, setStepData] = useState({});

  // 🧠 Generar o recuperar ID persistente
  const [formularioId] = useState(() => {
    const idGuardado = localStorage.getItem('formularioId');
    if (idGuardado) return idGuardado;
    const nuevoId = uuidv4();
    localStorage.setItem('formularioId', nuevoId);
    return nuevoId;
  });

  // Solo sincroniza cuando el usuario avanza de paso
  useSyncFormulario(formularioId, { ...formData, paso_actual: pasoActual }, pasoActual);

  // Cuando el usuario avanza de paso, actualiza el estado principal y limpia el temporal
  const handleNext = (nuevoPaso) => {
    setFormData(prev => ({
      ...prev,
      ...stepData,
      monto: prev.monto,
      plazo: prev.plazo
    }));
    setPasoActual(nuevoPaso);
    setStepData({});
  };

  const handleSubmit = () => {
    console.log('Formulario enviado:', formData);
    localStorage.removeItem('formularioId');
    localStorage.removeItem('formularioDbId');
    localStorage.removeItem('user_id');
    // Redirección o confirmación
  };

  const pasos = [
    <Step1_PersonalInfo
      key="paso1"
      formData={{ ...formData, ...stepData }}
      setFormData={setStepData}
      formularioId={formularioId}
      onNext={() => handleNext(1)}
      // No onPrev en el primer paso
    />,
    <Step2_Contacto
      key="paso2"
      formData={{ ...formData, ...stepData }}
      setFormData={setStepData}
      formularioId={formularioId}
      onNext={() => handleNext(2)}
      onPrev={() => setPasoActual(0)}
    />,
    <Step3_ActividadEconomica
      key="paso3"
      formData={{ ...formData, ...stepData }}
      setFormData={setStepData}
      formularioId={formularioId}
      onNext={() => handleNext(3)}
      onPrev={() => setPasoActual(1)}
    />,
    <Step4_Referencias
      key="paso4"
      formData={{ ...formData, ...stepData }}
      setFormData={setStepData}
      formularioId={formularioId}
      onNext={() => handleNext(4)}
      onPrev={() => setPasoActual(2)}
    />,
    <Step5_Bancarios
      key="paso5"
      formData={{ ...formData, ...stepData }}
      setFormData={setStepData}
      formularioId={formularioId}
      onNext={() => handleNext(5)}
      onPrev={() => setPasoActual(3)}
    />,
    <Step6_ResumenCredito
      key="paso6"
      formData={{ ...formData, ...stepData }}
      monto={monto}
      plazo={plazo}
      formularioId={formularioId}
      onNext={() => handleNext(6)}
      onPrev={() => setPasoActual(4)}
    />,
    <Step7_ConfirmacionFinal
      key="paso7"
      formData={{ ...formData, ...stepData }}
      setFormData={setStepData}
      formularioId={formularioId}
      onSubmit={handleSubmit}
      onPrev={() => setPasoActual(5)}
    />,
  ];

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'grid',
        placeItems: 'center',
        backgroundColor: '#ffffff',
        padding: '1rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          boxShadow: '0 0 20px rgba(0,0,0,0.1)',
          padding: '2rem',
          boxSizing: 'border-box',
        }}
      >
        {pasos[pasoActual]}
      </div>
    </div>
  );
};

export default Formulario;
