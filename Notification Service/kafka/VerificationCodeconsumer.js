import { Kafka } from 'kafkajs';
import { verificationEmail } from '../handlers/verificationEmail.js';

const kafka = new Kafka({
    clientId: 'Orbit-Notification-Service',
    brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: 'email-group' });

export const runConsumer = async () => {
    await consumer.connect();

    await consumer.subscribe({
        topic: 'email-verify-topic',
        fromBeginning: false,
    });

    await consumer.run({
        eachMessage: async ({ message }) => {
            await verificationEmail(message);
        },
    });
};

module.exports = { runConsumer };
