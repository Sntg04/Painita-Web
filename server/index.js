// backend/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import { resetPassword } from './controllers/authController.js';
import formularioRoutes from './routes/formulario.js';
import { pool } from './config/db.js'; // Asegura que la conexión esté activa
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
// CORS configurable: allow local dev, configured origins, and Render domains
const corsOrigins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl) or same-origin
    if (!origin) return callback(null, true);
    const isLocal = /^(http:\/\/localhost(:\d+)?|http:\/\/127\.0\.0\.1(:\d+)?)/.test(origin);
    const isRender = /\.onrender\.com$/.test(new URL(origin).hostname);
    const isWhitelisted = corsOrigins.includes(origin);
    if (isLocal || isRender || isWhitelisted) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  }
};
app.use(cors(corsOptions));
app.use(express.json());

// Servir archivos estáticos subidos (configurable)
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
try { fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } catch {}
app.use('/uploads', express.static(UPLOADS_DIR));

// Responder OPTIONS (preflight) de manera genérica para CORS
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    // cors() ya añadió los headers CORS arriba; solo respondemos
    return res.sendStatus(204);
  }
  next();
});

// Rutas
app.use('/api', (req, _res, next) => {
  console.log('[api]', req.method, req.url);
  next();
});
app.use('/api', authRoutes);
app.use('/api', formularioRoutes);
// Direct route registration to avoid any router issues
app.post('/api/reset-password', resetPassword);

// Nota: el fallback 404 de /api se declara más abajo, tras registrar todas las rutas

// Prueba de conexión a PostgreSQL (una vez al inicio)
const hasDbUrl = !!process.env.DATABASE_URL;
if (hasDbUrl) {
  pool.connect()
  .then(client => {
    console.log('🟢 Conectado a PostgreSQL');
    // Asegurar tipo y default de 'estado', y normalizar datos existentes
    client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'formularios' AND column_name = 'estado'
        ) THEN
          -- Intentar ampliar tipo para evitar truncamientos (por ejemplo, de char(1) a varchar(20))
          BEGIN
            EXECUTE 'ALTER TABLE formularios ALTER COLUMN estado TYPE varchar(20)';
          EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'No se pudo alterar tipo de estado (posiblemente ya es suficientemente amplio).';
          END;

          -- Establecer default 'pendiente'
          BEGIN
            EXECUTE 'ALTER TABLE formularios ALTER COLUMN estado SET DEFAULT ''pendiente''';
          EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'No se pudo establecer default de estado.';
          END;

          -- Normalizar registros existentes abreviados
          BEGIN
            EXECUTE 'UPDATE formularios SET estado = ''pendiente'' WHERE lower(estado) IN (''p'') OR estado IS NULL';
          EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'No se pudo normalizar valores existentes de estado.';
          END;
        ELSE
          RAISE NOTICE 'Columna estado no existe en formularios';
        END IF;

        -- Asegurar columnas para almacenar imágenes en DB
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'formularios' AND column_name = 'id_front_data'
        ) THEN
          BEGIN
            EXECUTE 'ALTER TABLE formularios ADD COLUMN id_front_data bytea';
          EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'No se pudo crear columna id_front_data';
          END;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'formularios' AND column_name = 'id_back_data'
        ) THEN
          BEGIN
            EXECUTE 'ALTER TABLE formularios ADD COLUMN id_back_data bytea';
          EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'No se pudo crear columna id_back_data';
          END;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'formularios' AND column_name = 'id_front_mime'
        ) THEN
          BEGIN
            EXECUTE 'ALTER TABLE formularios ADD COLUMN id_front_mime text';
          EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'No se pudo crear columna id_front_mime';
          END;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'formularios' AND column_name = 'id_back_mime'
        ) THEN
          BEGIN
            EXECUTE 'ALTER TABLE formularios ADD COLUMN id_back_mime text';
          EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'No se pudo crear columna id_back_mime';
          END;
        END IF;
      END
      $$;
    `)
      .catch(e => console.warn('Init SQL estado fallo:', e.message))
      .finally(() => client.release());
  })
  .catch((err) => {
    console.error('🔴 Error al conectar a PostgreSQL:', err.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('Continuando sin conexión a DB en desarrollo...');
    }
  });
} else {
  console.warn('DATABASE_URL no está configurada. Iniciando sin conexión a DB.');
}

// Ruta base opcional
app.get('/', (req, res) => {
  res.send('🧠 Painita backend activo');
});

// Healthcheck
app.get('/health', async (req, res) => {
  try {
    const db = await pool.query('SELECT 1');
    res.json({ ok: true, db: db?.rows?.[0]?.['?column?'] === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Simple ping for Render
app.get('/api/ping', (_req, res) => {
  res.json({ pong: true, time: new Date().toISOString() });
});

// Producción: servir cliente compilado (Vite)
// Buscamos en varias ubicaciones para mayor robustez en Render
const candidateDists = [
  path.join(process.cwd(), 'client_dist'),      // copiado dentro de /server en build
  path.join(process.cwd(), '../client/dist'),   // monorepo vecino (si Render lo incluye)
];
const foundDist = candidateDists.find(p => fs.existsSync(p));
if (foundDist) {
  app.use(express.static(foundDist));
  // Use regex para evitar problemas con path-to-regexp en Express 5
  app.get(/^(?!\/api|\/uploads).*/, (req, res, next) => {
    const indexFile = path.join(foundDist, 'index.html');
    if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
    return next();
  });
} else {
  console.warn('Cliente compilado no encontrado. Mostrando solo backend.');
}

// Debug: columnas de la tabla clientes
app.get('/api/debug/clientes/columns', async (_req, res) => {
  try {
    const q = `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'clientes'
      ORDER BY ordinal_position;
    `;
    const r = await pool.query(q);
    res.json({ columns: r.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores internos
app.use((err, req, res, next) => {
  console.error('🔥 Error interno:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`🚀 Painita backend corriendo en http://localhost:${PORT}`);
});
