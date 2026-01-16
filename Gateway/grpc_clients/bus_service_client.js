const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const proto_path = path.join(__dirname,"../proto","bus_service.proto");

const packageDefinition = protoLoader.loadSync(proto_path,{
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const bus_service_proto = grpc.loadPackageDefinition(packageDefinition).bus_service;

const client = new bus_service_proto.BusService(
    process.env.BUS_SERVICE_URL || 'localhost:50052',
    grpc.credentials.createInsecure()
);

module.export = client;