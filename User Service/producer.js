import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const produceEmailCode = async (email, code, name) => {
    //console.log("Producing email code for:", email, code, name);
    const producer = kafka.producer()
    await producer.connect()
    await producer.send({
        topic: 'email-verify-topic',
        messages: [
            { value: JSON.stringify({ email, code,name }) },
        ],
    })
    await producer.disconnect()
}

export { produceEmailCode };