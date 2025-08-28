import express from 'express';
import { pool } from '../config/db.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// --- Subida de imágenes de documentos (a memoria para guardar en DB) ---
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ruta para subir documentos
router.post('/formulario/upload-docs', upload.fields([
  { name: 'id_front', maxCount: 1 },
  { name: 'id_back', maxCount: 1 }
]), async (req, res) => {
  try {
    const { user_id, formulario_id } = req.body;
    const idFrontFile = req.files['id_front']?.[0];
    const idBackFile = req.files['id_back']?.[0];
    if (!idFrontFile || !idBackFile) {
      return res.status(400).json({ error: 'Faltan archivos.' });
    }
    // Guardar contenido binario directamente en PostgreSQL (bytea)
    const frontBuf = idFrontFile.buffer;
    const backBuf = idBackFile.buffer;
    const frontMime = idFrontFile.mimetype || 'application/octet-stream';
    const backMime = idBackFile.mimetype || 'application/octet-stream';

    await pool.query(
      'UPDATE formularios SET id_front_data = $1, id_front_mime = $2, id_back_data = $3, id_back_mime = $4 WHERE id = $5 AND user_id = $6',
      [frontBuf, frontMime, backBuf, backMime, formulario_id, user_id]
    );

    // Exponer URLs para consultar las imágenes desde DB
    const base = `${req.protocol}://${req.get('host')}`;
    const idFrontUrl = `${base}/api/formulario/${formulario_id}/doc/id_front`;
    const idBackUrl = `${base}/api/formulario/${formulario_id}/doc/id_back`;
    res.json({ success: true, id_front: idFrontUrl, id_back: idBackUrl });
  } catch (error) {
    console.error('Error al subir documentos:', error);
    res.status(500).json({ error: 'Error al subir documentos.' });
  }
});



// Crear nuevo formulario asociado a un usuario
router.post('/formulario', async (req, res) => {
  const data = req.body;
  // Convierte valores vacíos ('') en null para evitar errores de tipo en PostgreSQL
  Object.keys(data).forEach(key => {
    if (data[key] === '') data[key] = null;
  });
  // Estado predeterminado siempre 'pendiente' al crear (ignorar cualquier valor entrante)
  if (Object.prototype.hasOwnProperty.call(data, 'estado')) {
    delete data.estado;
  }
  data.estado = 'pendiente';
  const { user_id } = data;
  try {
    if (!user_id) {
      return res.status(400).json({ error: 'Falta user_id para asociar el formulario.' });
    }
    // Evita duplicados: solo crea si el uuid no existe
    const { uuid } = data;
    if (!uuid) {
      return res.status(400).json({ error: 'Falta uuid para identificar el formulario.' });
    }
    const existeUuid = await pool.query('SELECT id FROM formularios WHERE uuid = $1 LIMIT 1', [uuid]);
    if (existeUuid.rows.length > 0) {
      // Ya existe, devuelve el id existente
      return res.status(200).json({ id: existeUuid.rows[0].id, existe: true });
    }
    // Si no existe, crea uno nuevo
    const campos = Object.keys(data).map((key) => `"${key}"`).join(', ');
    const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
    const valores = Object.values(data);
    const query = `INSERT INTO formularios (${campos}) VALUES (${placeholders}) RETURNING id`;
    try {
      const result = await pool.query(query, valores);
      if (result.rows && result.rows[0] && result.rows[0].id) {
        return res.status(201).json({ id: result.rows[0].id, existe: false });
      } else {
        console.error('Error: La inserción no devolvió un id.', { query, valores, result });
        return res.status(500).json({ error: 'No se pudo crear el formulario.' });
      }
    } catch (dbError) {
      console.error('Error SQL al crear el formulario:', {
        data,
        query,
        valores,
        error: dbError.message
      });
      return res.status(500).json({ error: 'Error SQL al crear el formulario', detalle: dbError.message });
    }
  } catch (error) {
    console.error('Error general al crear el formulario:', error);
    res.status(500).json({ error: 'Error general al crear el formulario' });
  }
});


// Actualizar formulario existente
router.post('/formulario/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  // Convierte valores vacíos ('') en null para evitar errores de tipo en PostgreSQL
  Object.keys(data).forEach(key => {
    if (data[key] === '') data[key] = null;
  });
  try {
    // Filtra campos nulos/undefined y user_id (no debe actualizarse)
    const validData = Object.entries(data)
  .filter(([key, value]) => value !== undefined && value !== null && key !== 'user_id' && key !== 'estado')
      .reduce((obj, [key, value]) => { obj[key] = value; return obj; }, {});

    if (Object.keys(validData).length === 0) {
      return res.status(400).json({ error: 'No hay datos válidos para actualizar.' });
    }

    const campos = Object.keys(validData)
      .map((key, i) => `"${key}" = $${i + 1}`)
      .join(', ');
    const valores = Object.values(validData);

    const query = `UPDATE formularios SET ${campos} WHERE id = $${valores.length + 1}`;
    try {
      await pool.query(query, [...valores, id]);
      return res.status(200).json({ message: 'Formulario actualizado' });
    } catch (dbError) {
      console.error('Error SQL al actualizar el formulario:', {
        id,
        validData,
        query,
        valores: [...valores, id],
        error: dbError.message
      });
      return res.status(500).json({ error: 'Error SQL al actualizar el formulario', detalle: dbError.message });
    }
  } catch (error) {
    console.error('Error general al actualizar el formulario:', error);
    res.status(500).json({ error: 'Error general al actualizar el formulario' });
  }
});

// Consultar estado del formulario de un usuario
router.get('/formulario/estado/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query('SELECT id, paso_actual FROM formularios WHERE user_id = $1 ORDER BY id DESC LIMIT 1', [user_id]);
    if (result.rows.length === 0) {
      return res.json({ existe: false });
    }
    const { id, paso_actual } = result.rows[0];
    res.json({ existe: true, id, paso_actual });
  } catch (error) {
    console.error('Error al consultar estado del formulario:', error);
    res.status(500).json({ error: 'Error al consultar estado del formulario' });
  }
});

export default router;

// --- Servir imágenes almacenadas en DB ---
// GET /api/formulario/:id/doc/id_front | id_back
router.get('/formulario/:id/doc/:which', async (req, res) => {
  try {
    const { id, which } = req.params;
    const allowed = new Set(['id_front', 'id_back']);
    if (!allowed.has(which)) return res.status(400).json({ error: 'Parámetro inválido.' });

    const mimeCol = which === 'id_front' ? 'id_front_mime' : 'id_back_mime';
    const dataCol = which === 'id_front' ? 'id_front_data' : 'id_back_data';
    const q = `SELECT ${mimeCol} as mime, ${dataCol} as data FROM formularios WHERE id = $1 LIMIT 1`;
    const r = await pool.query(q, [id]);
    if (r.rows.length === 0 || !r.rows[0].data) {
      return res.status(404).json({ error: 'No encontrado' });
    }
    const mime = r.rows[0].mime || 'application/octet-stream';
    const buf = r.rows[0].data; // es un Buffer en node-postgres
    res.setHeader('Content-Type', mime);
    res.send(buf);
  } catch (e) {
    console.error('Error al servir documento:', e);
    res.status(500).json({ error: 'Error al servir documento' });
  }
});
