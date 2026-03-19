import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';
import productRoutes from './src/routes/productRoutes';
import inventarioRoutes from './src/routes/inventarioRoutes';
import gananciasRoutes from './src/routes/gananciasRoutes';
import authRoutes from './src/routes/authRoutes';
import facturaRoutes from './src/routes/facturaRoutes';
import clienteRoutes from './src/routes/clienteRoutes';
import usuariosRoutes from './src/routes/usuariosRoutes';
import payablesRoutes from './src/routes/payablesRoutes';
import cajaRoutes from './src/routes/cajaRoutes';
import { requestLogger } from './src/middlewares/logger';
import { errorHandler } from './src/middlewares/errorHandler';
import { crearBackup } from './src/services/BackupService';
import backupRouter from './src/routes/backup';

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(requestLogger);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Demasiadas solicitudes, intenta más tarde'
});
app.use('/api/', limiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// API routes
app.use('/api', productRoutes);
app.use('/api', inventarioRoutes);
app.use('/api', gananciasRoutes);
app.use('/api', authRoutes);
app.use('/api', facturaRoutes);
app.use('/api', clienteRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', payablesRoutes);
app.use('/api', cajaRoutes);
app.use('/api/backup', backupRouter);

// Global error handler
app.use(errorHandler);

if (require.main === module) {
  const port = Number(process.env.PORT || 3001);
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
    // Backup automático cada día a las 2am
    cron.schedule('0 2 * * *', () => {
      crearBackup();
    });
    // Backup también al iniciar la app
    crearBackup();
  });
}

export default app;
