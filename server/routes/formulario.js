import express from 'express';
import { pool } from '../config/db.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// --- Subida de imágenes de documentos ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
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
    // Construir rutas relativas y URLs públicas accesibles vía HTTP
    const frontRel = `/uploads/${path.basename(idFrontFile.path)}`;
    const backRel = `/uploads/${path.basename(idBackFile.path)}`;

    // Guardar rutas relativas en DB (portables)
    await pool.query(
      'UPDATE formularios SET id_front = $1, id_back = $2 WHERE id = $3 AND user_id = $4',
      [frontRel, backRel, formulario_id, user_id]
    );

    const base = `${req.protocol}://${req.get('host')}`;
    res.json({ success: true, id_front: `${base}${frontRel}`, id_back: `${base}${backRel}` });
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
