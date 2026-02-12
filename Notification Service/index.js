require('dotenv').config();

const { runConsumer } = require('./kafka/consumer');
const { runBookingConsumer } = require('./kafka/VerificationCodeconsumer');

runBookingConsumer().catch(console.error);
runConsumer().catch(console.error);
