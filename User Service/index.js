import 'dotenv/config';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import userLogin from './services/userLogin.js';
import userRegister from './services/userRegister.js';
import adminLogin from './services/adminLogin.js';
import getUser from './services/getUser.js';
import verifyUser from './services/verify.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, 'user.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const serverKey = fs.readFileSync("certs/user-service.key");
const serverCert = fs.readFileSync("certs/user-service.crt");
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

    const PORT = process.env.PORT || '0.0.0.0:50051';

    server.bindAsync(PORT, creds, () => {
        console.log(` gRPC UserService running at ${PORT}`);
    });
}

main();