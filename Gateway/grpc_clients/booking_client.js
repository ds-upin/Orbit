const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const proto_path = path.join(__dirname,"../proto","booking.proto");

const packageDefinition = protoLoader.loadSync(proto_path,{
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const booking_proto = grpc.loadPackageDefinition(packageDefinition).booking;

const client = new booking_proto.BookingService(
    process.env.BOOKING_SERVICE_URL || 'localhost:50053',
    grpc.credentials.createInsecure()
);

module.exports = client;