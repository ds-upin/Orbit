require('dotenv').config();

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const userLogin = require('./services/userLogin');
const userRegister = require('./services/userRegister');
const adminLogin = require('./services/adminLogin');
const getUser = require('./services/getUser');
const verifyUser = require('./services/verify');

const PROTO_PATH = path.join(__dirname, 'user.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const userProto = grpc.loadPackageDefinition(packageDefinition).user;



function main() {
    const server = new grpc.Server();

    server.addService(userProto.UserService.service, {
        userLogin,
        userRegister,
        adminLogin,
        getUser,
        verifyUser,
    });

    const PORT = '0.0.0.0:50051';

    server.bindAsync(
        PORT,
        grpc.ServerCredentials.createInsecure(),
        () => {
            console.log(`🚀 gRPC UserService running at ${PORT}`);
        }
    );
}

main();
