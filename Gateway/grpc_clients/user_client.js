const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const fs = require('fs');

const PROTO_PATH = path.join(__dirname, '../proto/user.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
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

const userProto = grpc.loadPackageDefinition(packageDefinition).user;

const client = new userProto.UserService(
    process.env.USER_SERVICE_URL || '127.0.0.1:50051',
    creds
);

module.exports = client;
