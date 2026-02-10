require('dotenv').config();

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const fs = require('fs');

const { addBooking } = require('./handlers/addBooking');
const { runScheduleConsumer } = require('./consumers/schedule.consumer');
const { runPaymentConsumer } = require('./consumers/paymentVerification.consumer');

const proto_path = path.join(__dirname, 'booking.proto');

runScheduleConsumer().catch(console.error);
runPaymentConsumer().catch(console.error);

const packageDefinition = protoLoader.loadSync(proto_path, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const serverKey = fs.readFileSync("certs/booking-service.key");
const serverCert = fs.readFileSync("certs/booking-service.crt");
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

const booking_proto = grpc.loadPackageDefinition(packageDefinition).booking;

function main() {
    const server = new grpc.Server();
    server.addService(booking_proto.BookingService.service, {
        AddBooking: addBooking,
    });

    const PORT = process.env.GRPC_SERVER_ADDR || "0.0.0.0:50053";

    server.bindAsync(
        PORT,
        creds,
        () => {
            server.start();
            console.log(`gRPC UserService running at ${PORT}`);
        }
    )
}

main();