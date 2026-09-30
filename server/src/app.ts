import express from 'express';
import { snailpayRouter } from './routes/snailpay.routes';

export const app = express();

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'estoy vivo :)' });
});

app.use('/api/snailpay', snailpayRouter);