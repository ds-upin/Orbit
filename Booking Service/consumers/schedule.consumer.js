import { Kafka } from 'kafkajs';
import { updateSchedule } from '../handlers/updateSchedule.js'; 

const kafka = new Kafka({
    clientId: 'booking-schedule-consumer',
    brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: 'booking-schedule-group' });

export const runScheduleConsumer = async () => {
    await consumer.connect();

    await consumer.subscribe({
        topic: 'schedule-topic',
        fromBeginning: false,
    });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const parsedMessage = JSON.parse(message.value.toString());
            console.log(parsedMessage.data);
            await updateSchedule(parsedMessage.data);
        },
    });
};