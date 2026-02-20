import 'dotenv/config'; 

import { runConsumer } from './kafka/consumer.js';
import { runBookingConsumer } from './kafka/VerificationCodeconsumer.js';

runBookingConsumer().catch(console.error);
runConsumer().catch(console.error);