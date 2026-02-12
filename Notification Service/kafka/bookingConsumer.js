const { Kafka } = require('kafkajs');
const { bookingEmail } = require('../handlers/bookingEmail');

const kafka = new Kafka({
    clientId: 'Orbit-Booking-Notification-Service',
    brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: 'booking-email-group' });

const runBookingConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({
        topic: 'booking-status-topic',
        fromBeginning: false,
    });
    await consumer.run({
        eachMessage: async ({ message }) => {
            await bookingEmail(message);
        },
    });
};

module.exports = { runBookingConsumer };