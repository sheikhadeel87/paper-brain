import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const PORT = process.env.PORT || 8000;
const mongoUri =
  (typeof process.env.MONGO_URI === 'string' && process.env.MONGO_URI.trim()) ||
  'mongodb://127.0.0.1:27017/paper-brain';

if (!process.env.MONGO_URI?.trim()) {
  console.warn(
    'MONGO_URI not set; using mongodb://127.0.0.1:27017/paper-brain (database: paper-brain).'
  );
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.log(err));
