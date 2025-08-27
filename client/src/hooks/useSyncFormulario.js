import { useEffect } from 'react';


export default function useSyncFormulario(formularioId, data, pasoActual) {
  useEffect(() => {
    if (!formularioId || !data) return;

    const sync = async () => {
      try {
  // Usa el proxy de Vite y variable de entorno para base URL del API
  const API_BASE_URL = import.meta?.env?.VITE_API_BASE_URL || '/api';
        let dbId = localStorage.getItem('formularioDbId');

        const user_id = localStorage.getItem('user_id');
        if (!user_id) {
          console.warn('No hay user_id en localStorage. El usuario debe iniciar sesión.');
          return;
        }
        if (!dbId) {
          // Crear nuevo registro en la base de datos
          const res = await fetch(`${API_BASE_URL}/formulario`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...data, uuid: formularioId, user_id }),
          });
          if (res.ok) {
            const result = await res.json();
            if (result && result.id) {
              dbId = result.id;
              localStorage.setItem('formularioDbId', dbId);
              console.log(`✅ Formulario creado en DB con id ${dbId}`);
            } else {
              console.warn('⚠️ La respuesta del backend no contiene un id válido.');
              localStorage.removeItem('formularioDbId');
              return;
            }
          } else {
            console.warn(`⚠️ Error al crear formulario: ${res.status}`);
            localStorage.removeItem('formularioDbId');
            return;
          }
        } else {
          // Actualizar registro existente
          const res = await fetch(`${API_BASE_URL}/formulario/${dbId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...data, uuid: formularioId, user_id }),
          });
          if (!res.ok) {
            console.warn(`⚠️ Error al sincronizar paso: ${res.status}`);
          } else {
            console.log(`✅ Paso sincronizado en DB con id ${dbId}`);
          }
        }
      } catch (error) {
        console.error('❌ Fallo en la sincronización:', error);
      }
    };

    sync();
  }, [formularioId, data, pasoActual]); // Solo guarda cuando cambia el paso
}
