import 'dotenv/config';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { InitiatePayment } from './handlers/initiatePayment.js';
import { ConfirmPayment } from './handlers/webhookHandler.js';
import { runScheduleConsumer } from './consumer/schedule.consumer.js';

// Run consumer immediately
runScheduleConsumer().catch(console.error);

// __dirname replacement for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const proto_path = path.join(__dirname, 'payment.proto');

const packageDefinition = protoLoader.loadSync(proto_path, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const serverKey = fs.readFileSync("certs/payment-service.key");
const serverCert = fs.readFileSync("certs/payment-service.crt");
const caCert = fs.readFileSync("certs/ca.crt");

const creds = grpc.ServerCredentials.createSsl(
    caCert,
    [
        {
            private_key: serverKey,
            cert_chain: serverCert,
        },
    ],
    true
);

const payment_proto = grpc.loadPackageDefinition(packageDefinition).payment;

function main() {
    const PORT = process.env.GRPC_SERVER_ADDR || "0.0.0.0:50054";
    const server = new grpc.Server();

    server.addService(payment_proto.PaymentService.service, {
        InitiatePayment,
        ConfirmPayment,
    });

    server.bindAsync(PORT, creds, () => {
        console.log(`gRPC PaymentService running at ${PORT}`);
    });
}

main();