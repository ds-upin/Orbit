require('dotenv').config()

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path')

const { InitiatePayment } = require('./handlers/initiatePayment');
const { ConfirmPayment } = require('./handlers/webhookHandler');

const { runScheduleConsumer } = require('./consumer/schedule.consumer');
runScheduleConsumer().catch(console.error);

const proto_path = path.join(__dirname,'payment.proto');

const packageDefinition = protoLoader.loadSync(proto_path, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const payment_proto = grpc.loadPackageDefinition(packageDefinition).payment;

function main() {
    const PORT = process.env.GRPC_SERVER_ADDR || "0.0.0.0:50054";
    const server = new grpc.Server();
    server.addService(payment_proto.PaymentService.service,{
        InitiatePayment,
        ConfirmPayment,
    });
    server.bindAsync(
        PORT,
        grpc.ServerCredentials.createInsecure(),
        ()=>{
            console.log(`gRPC PaymentService running at ${PORT}`);
        }
    );
}
main();