const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const fs = require('fs');

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
    process.env.BOOKING_SERVICE_URL || '0.0.0.0:50053',
    creds,
);

module.exports = client;