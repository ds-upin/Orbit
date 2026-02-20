import { Kafka } from 'kafkajs';
import { verifyPayment } from '../handlers/paymentVerification.js';

const kafka = new Kafka({
    clientId: 'booking-payment-consumer',
    brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: 'booking-payment-group' });

export const runPaymentConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({
        topic: 'payment-topic',
        fromBeginning: false,
    });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const parsedMessage = JSON.parse(message.value.toString());
            await verifyPayment(parsedMessage);
        },
    });
};