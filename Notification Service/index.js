require('dotenv').config();

const { runConsumer } = require('./kafka/consumer');

runConsumer().catch(console.error);
