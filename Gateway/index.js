require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRouter = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3022;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRouter);

app.listen(PORT, () => {
    console.log(`Gateway service is running on port ${PORT}`);
});   