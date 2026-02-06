const { Kafka } = require('kafkajs');
const { verifyPayment } = require('../handlers/paymentVerification');

const kafka = new Kafka({
    clientId: 'booking-payment-consumer',
    brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: 'booking-payment-group' });

const runPaymentConsumer = async () => {
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

module.exports = { runPaymentConsumer };