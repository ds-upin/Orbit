const { Kafka } = require('kafkajs');
const { verificationEmail } = require('../handlers/verificationEmail');

const kafka = new Kafka({
    clientId: 'Orbit-Notification-Service',
    brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: 'email-group' });

const runConsumer = async () => {
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
