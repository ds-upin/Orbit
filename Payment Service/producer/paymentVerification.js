import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    cientId: 'Orbit-Payment-Verificatio-Service',
    brokers: [process.env.Kafka],
});

const paymentDataVerification = async (data) => {
    try {
        const producer = kafka.producer();
        await producer.connect();
        await producer.send({
            topic: 'payment-topic',
            messages: [
                { value: JSON.stringify({ 
                    data,
                }) }
            ]
        });
        await producer.disconnect();
        return true;
    } catch (err) {
        console.log("Error in data producing after verification: ", err);
        return false;
    }
};

export { paymentDataVerification };