const client = require('../../grpc_clients/bus_service_client');

const getBus = async (req, res) => {
    let { bus_number } = req.body;

    if (bus_number === undefined) {
        return res.status(400).json({
            msg: 'bus_number is required'
        });
    }

    if (typeof bus_number !== 'string') {
        return res.status(400).json({
            msg: 'bus_number must be a string'
        });
    }

    bus_number = bus_number.trim();
    if (bus_number.length === 0) {
        return res.status(400).json({
            msg: 'bus_number cannot be empty'
        });
    }

    const busNumberRegex = /^[A-Z0-9\- ]+$/i;
    if (!busNumberRegex.test(bus_number)) {
        return res.status(400).json({
            msg: 'bus_number contains invalid characters'
        });
    }

    client.GetBus(
        { bus_number },
        (err, grpcResponse) => {
            if (err) {
                return res.status(500).json({
                    msg: 'gRPC error',
                    error: err.message
                });
            }

            return res.status(grpcResponse.status).json({
                msg: grpcResponse.msg,
                bus: grpcResponse.bus
            });
        }
    );
};

// rpc GetBuses(ReqBuses) returns(ResBuses);
const getBuses = async (req, res) => { };

// rpc AddBus(ReqAddBus) returns(ResAddBus);
const addBus = async (req, res) => { };

// rpc UpdateBus(ReqUpdateBus) returns(ResUpdateBus);
const updateBus = async (req, res) => { };

// rpc DeleteBus(ReqDeleteBus) returns(ResDeleteBus);
const deleteBus = async (req, res) => { }; 

module.exports = {getBus, getBuses, addBus, updateBus, deleteBus };