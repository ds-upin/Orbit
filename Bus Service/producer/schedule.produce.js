import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'schedule-producer',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});


const produceSchedule = async ({ data }) => {
    try {
        const producer = kafka.producer();
        await producer.connect();
        await producer.send({
            topic: 'schedule-topic',
            messages: [
                { value: JSON.stringify({ "data": data }) },
            ],
        });
        await producer.disconnect();
        return true;
    } catch (err) {
        console.log("Error in data verification kafka");
        return false;
    }
}

export { produceSchedule };