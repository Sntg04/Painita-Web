// src/services/tumipay.js
import axios from 'axios';

const TUMIPAY_API_URL = 'https://connect.tumipay.co/api/checkout/session';

export async function crearSesionPago({ monto, referencia, nombre }) {
  try {
    const response = await axios.post(TUMIPAY_API_URL, {
      amount: monto,
      reference: referencia,
      customer: {
        name: nombre,
      },
      redirectUrl: 'https://painita.co/confirmacion', // Ajusta según tu frontend
    });

    return response.data.checkoutUrl;
  } catch (error) {
    console.error('❌ Error al crear sesión de pago:', error.message);
    throw new Error('No se pudo iniciar el pago con Tumipay');
  }
}
