const client = require('../../grpc_clients/bus_service_client');

const isValidString = (value) => {
    return typeof value === 'string' && value.trim().length > 0;
};

const getRoute = async (req, res) => {
    const { route_id } = req.params;

    if (!route_id) {
        return res.status(400).json({
            msg: 'route_id is required'
        });
    }

    client.GetRoute(
        { route_id: Number(route_id) },
        (err, grpcResponse) => {
            if (err) {
                return res.status(500).json({
                    msg: 'gRPC error',
                    error: err.message
                });
            }

            return res.status(grpcResponse.status).json({
                route_id: grpcResponse.route_id,
                source: grpcResponse.source,
                destination: grpcResponse.destination,
                distance: grpcResponse.distance,
                msg: grpcResponse.msg
            });
        }
    );
};


const addRoute = async (req, res) => {
    const { source, destination, distance } = req.body;

    if (
        !isValidString(source) ||
        !isValidString(destination)
    ) {
        return res.status(400).json({
            msg: 'source and destination must be non-empty strings'
        });
    }

    if (!Number.isInteger(Number(distance)) || distance < 0.1) {
        return res.status(400).json({
            msg: 'distance must be a number'
        });
    }

    client.AddRoute(
        {
            source: source.trim(),
            destination: destination.trim(),
            distance: Number(distance)
        },
        (err, grpcResponse) => {
            if (err) {
                return res.status(500).json({ msg: err.message });
            }

            return res.status(grpcResponse.status).json(grpcResponse);
        }
    );
};


module.exports = { getRoute, addRoute };