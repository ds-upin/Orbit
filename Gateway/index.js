import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import userRouter from './routes/userRoutes.js';
import busRouter from './routes/busRoute.js';
import modelRouter from './routes/modelRoute.js';
import routeRouter from './routes/routeRoute.js';
import seatRouter from './routes/seatRouter.js';
import webhookRouter from './routes/webhookRoute.js';
import bookingRouter from './routes/bookingRoute.js';
import paymentRouter from './routes/paymentRouter.js';
import scheduleController from './routes/scheduleRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3022;

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(cors());
app.use(helmet());

app.use("/webhook", webhookRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10kb" }));

app.set('trust proxy', 1);
app.use(limiter);

app.use("/users", userRouter);
app.use("/model", modelRouter);
app.use('/route', routeRouter);
app.use('/seat', seatRouter);
app.use("/bus", busRouter);
app.use('/payment', paymentRouter);
app.use('/schedule', scheduleController);
app.use('/book', bookingRouter);

app.listen(PORT, () => {
    console.log(`Gateway service is running on port ${PORT}`);
});