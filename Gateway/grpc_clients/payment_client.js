const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, "../proto", "payment.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const paymentProto = grpc.loadPackageDefinition(packageDefinition).payment;

const client = new paymentProto.PaymentService(
    process.env.PAYMENT_SERVICE_URL || 'localhost:50054',
    grpc.credentials.createInsecure()
)

module.exports = client;
