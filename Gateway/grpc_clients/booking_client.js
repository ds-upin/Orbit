import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const proto_path = path.join(__dirname, "../proto", "booking.proto");

const packageDefinition = protoLoader.loadSync(proto_path, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const caCert = fs.readFileSync(path.join(__dirname, "../certs/ca.crt"));
const gatewayKey = fs.readFileSync(path.join(__dirname, "../certs/gateway.key"));
const gatewayCert = fs.readFileSync(path.join(__dirname, "../certs/gateway.crt"));
const creds = grpc.credentials.createSsl(
    caCert,
    gatewayKey,
    gatewayCert
);

const booking_proto = grpc.loadPackageDefinition(packageDefinition).booking;

const client = new booking_proto.BookingService(
    process.env.BOOKING_SERVICE_URL || '127.0.0.1:50053',
    creds,
);

export default client;