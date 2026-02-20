import 'dotenv/config';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { addBooking } from './handlers/addBooking.js';
import { runScheduleConsumer } from './consumers/schedule.consumer.js';
import { runPaymentConsumer } from './consumers/paymentVerification.consumer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

runScheduleConsumer().catch(console.error);
runPaymentConsumer().catch(console.error);

const proto_path = path.join(__dirname, 'booking.proto');
const packageDefinition = protoLoader.loadSync(proto_path, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const serverKey = fs.readFileSync(path.join(__dirname, 'certs/booking-service.key'));
const serverCert = fs.readFileSync(path.join(__dirname, 'certs/booking-service.crt'));
const caCert = fs.readFileSync(path.join(__dirname, 'certs/ca.crt'));
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

const booking_proto = grpc.loadPackageDefinition(packageDefinition).booking;

function main() {
    const server = new grpc.Server();

    server.addService(booking_proto.BookingService.service, {
        AddBooking: addBooking,
    });

    const PORT = process.env.GRPC_SERVER_ADDR || '0.0.0.0:50053';

    server.bindAsync(PORT, creds, (err, port) => {
        if (err) {
            console.error('gRPC server failed to start:', err);
            return;
        }
        console.log(`gRPC BookingService running at ${PORT}`);
        server.start();
    });
}

main();