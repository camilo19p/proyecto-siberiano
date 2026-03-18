import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import productRoutes from './src/routes/productRoutes';
import inventarioRoutes from './src/routes/inventarioRoutes';
import gananciasRoutes from './src/routes/gananciasRoutes';
import { requestLogger } from './src/middlewares/logger';
import { rateLimiter } from './src/middlewares/rateLimiter';
import { errorHandler } from './src/middlewares/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(rateLimiter);
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// API routes
app.use('/api', productRoutes);
app.use('/api', inventarioRoutes);
app.use('/api', gananciasRoutes);

// Global error handler
app.use(errorHandler);

if (require.main === module) {
  const port = Number(process.env.PORT || 3001);
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}

export default app;
