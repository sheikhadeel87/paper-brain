import express from 'express';
import cors from 'cors';
import receiptRoutes from './routes/receipt.js';
import expenseRoutes from './routes/expenses.js';

const app = express();

app.use(
  cors({
    exposedHeaders: ['X-Process-Time-Ms'],
  }),
);
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use('/api/receipt', receiptRoutes);
app.use('/api/expenses', expenseRoutes);

export default app;
