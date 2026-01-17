require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRouter = require('./routes/userRoutes');
const busRouter = require('./routes/busRoute');
const modelRouter = require('./routes/modelRoute');
const routeRouter = require('./routes/routeRoute');
const seatRouter = require('./routes/seatRouter');
const scheduleController = require('./routes/scheduleRoute');
const { default: helmet } = require('helmet');

const app = express();
const PORT = process.env.PORT || 3022;

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRouter);  // Done
app.use("/model",modelRouter);  // Done
app.use('/route',routeRouter);  // Done
app.use('/seat',seatRouter);
app.use("/bus", busRouter);
app.use('/schedule',scheduleController);

app.listen(PORT, () => {
    console.log(`Gateway service is running on port ${PORT}`);
});   