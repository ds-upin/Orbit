require('dotenv').config();

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const bus_controller = require('./handlers/buses');
const model_controller = require('./handlers/model');
const route_controller = require('./handlers/routes');
const seat_controller = require('./handlers/seats');
const schedule_controller = require('./handlers/schedules');
 
const proto_path = path.join(__dirname, 'bus_service.proto');

const packageDefinition = protoLoader.loadSync(proto_path, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const bus_service_proto = grpc.loadPackageDefinition(packageDefinition).bus_service;

function main() {
    const server = new grpc.Server();
    server.addService(bus_service_proto.BusService.service, {
        GetBus: bus_controller.getBus,
        GetBuses: bus_controller.getBuses,
        AddBus: bus_controller.addBus,
        UpdateBus: bus_controller.updateBus,
        DeleteBus: bus_controller.deleteBus,

        AddSeat: seat_controller.addSeat,
        DeleteSeat: seat_controller.deleteSeat,

        GetModels: model_controller.getModels,
        GetModel: model_controller.getModel,
        AddModel: model_controller.addModel,

        AddRoute: route_controller.addRoute,
        GetRoute: route_controller.getRoute,
        AddSchedule: schedule_controller.addSchedule,
        UpdateSchedule: schedule_controller.updateSchedule,
        DeleteSchedule: schedule_controller.deleteSchedule,
        GetSchedule: schedule_controller.getSchedule,
        GetSchedules: schedule_controller.getSchedules,
        GetScheduledBuses: schedule_controller.getScheduledBuses,
        GetScheduledBusesByRoute: schedule_controller.getScheduledBusesByRoute
    });

    const PORT = process.env.GRPC_SERVER_ADDR || "0.0.0.0:50052";
    server.bindAsync(
        PORT,
        grpc.ServerCredentials.createInsecure(),
        () => {
            console.log(`🚀 gRPC UserService running at ${PORT}`);
        }
    );
}

main();