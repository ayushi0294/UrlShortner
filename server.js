import express, { json } from 'express';
import { connect } from 'mongoose';
import { config } from 'dotenv';
import cors from 'cors';
import urlRoutes from './routes/urlRoutes.js';
import limiter from './middleware/rateLimiter.js';

config();
export const app = express();
app.use(json());
app.use(cors());
app.use(limiter);

connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error(err));

app.use('/', urlRoutes);

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
