const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'admin-client',
  brokers: ['localhost:9092'], // e.g., 'localhost:9092'
});

const admin = kafka.admin();

const clearTopic = async (topicName) => {
  try {
    await admin.connect();
    console.log(`Connected to Kafka broker`);

    // Delete the topic
    console.log(`Deleting topic "${topicName}"...`);
    await admin.deleteTopics({ topics: [topicName] });
    console.log(`Topic "${topicName}" deleted successfully`);

    // Recreate the topic
    console.log(`Recreating topic "${topicName}"...`);
    await admin.createTopics({
      topics: [
        {
          topic: topicName,
          numPartitions: 1,       // adjust if your topic has multiple partitions
          replicationFactor: 1,   // adjust based on your Kafka cluster
        },
      ],
    });
    console.log(`Topic "${topicName}" recreated successfully`);
  } catch (err) {
    console.error(`Error clearing topic "${topicName}":`, err);
  } finally {
    await admin.disconnect();
    console.log(`Disconnected from Kafka broker`);
  }
};

clearTopic('email-verify-topic');
clearTopic('payment-topic');