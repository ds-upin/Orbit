const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'verify-admin',
  brokers: ['localhost:9092'],
});

async function verifyTopic() {
  const admin = kafka.admin();
  await admin.connect();

  const topics = await admin.listTopics();
  console.log('Topics:', topics);

  const metadata = await admin.fetchTopicMetadata({
    topics: ['email-verify-topic'],
  });
  console.dir(metadata, { depth: null });

  await admin.disconnect();
}

verifyTopic().catch(console.error);
