require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const userRouter = require('./routes/userRoutes');
const busRouter = require('./routes/busRoute');
const modelRouter = require('./routes/modelRoute');
const routeRouter = require('./routes/routeRoute');
const seatRouter = require('./routes/seatRouter');
const webhookRouter = require('./routes/webhookRoute');
const bookingRouter = require('./routes/bookingRoute');
const paymentRouter = require('./routes/paymentRouter');
const scheduleController = require('./routes/scheduleRoute');
const { default: helmet } = require('helmet');

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

app.use(limiter);  
app.use("/users", userRouter);  // Done
app.use("/model", modelRouter);  // Done
app.use('/route', routeRouter);  // Done
app.use('/seat', seatRouter);    // Done
app.use("/bus", busRouter);     // Done
app.use('/payment', paymentRouter);
app.use('/schedule', scheduleController);
app.use('/book', bookingRouter);

app.listen(PORT, () => {
    console.log(`Gateway service is running on port ${PORT}`);
});   