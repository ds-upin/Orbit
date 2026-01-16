require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRouter = require('./routes/userRoutes');
const busRouter = require('./routes/busRoute');
const modelRouter = require('./routes/modelRoute');
const routeRouter = require('./routes/routeRoute');
const seatRouter = require('./routes/seatRouter');

const app = express();
const PORT = process.env.PORT || 3022;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRouter);
app.use("/bus", busRouter);
app.use("/model",modelRouter);
app.use('/route',routeRouter);
app.use('/seat',seatRouter);

app.listen(PORT, () => {
    console.log(`Gateway service is running on port ${PORT}`);
});   