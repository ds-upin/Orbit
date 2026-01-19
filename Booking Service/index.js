require('dotenv').config();

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const { addBooking } = require('./handlers/addBooking');

const proto_path = path.join(__dirname, 'booking.proto');

const packageDefinition = protoLoader.loadSync(proto_path, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const booking_proto = grpc.loadPackageDefinition(packageDefinition).booking;

function main() {
    const server = new grpc.Server();
    server.addService(booking_proto.BookingService.service, {
        AddBooking: addBooking
    });

    const PORT = process.env.GRPC_SERVER_ADDR || "0.0.0.0:50053";

    server.bindAsync(
        PORT,
        grpc.ServerCredentials.createInsecure(),
        () => {
            console.log(`🚀 gRPC UserService running at ${PORT}`);
        }
    )
}

main();