import client from '../../grpc_clients/bus_service_client.js';

const getBus = async (req, res) => {
    let { bus_number } = req.query;

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

const getBuses = async (req, res) => {
    try {
        let { limit, skip } = req.query;

        limit = limit ? parseInt(limit, 10) : 10;
        skip = skip ? parseInt(skip, 10) : 0;

        if (isNaN(limit) || limit <= 0) {
            return res.status(400).json({
                status: 400,
                msg: 'limit must be a positive number',
            });
        }
        if (isNaN(skip) || skip < 0) {
            return res.status(400).json({
                status: 400,
                msg: 'skip must be a non-negative number',
            });
        }

        const request = { limit, skip };

        client.GetBuses(request, (err, response) => {
            if (err) {
                return res.status(500).json({
                    status: 500,
                    msg: err.message || 'gRPC service error',
                });
            }

            return res.status(response.status || 200).json({
                status: response.status,
                msg: response.msg,
                buses: response.buses || [],
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            msg: 'Internal server error',
        });
    }
};

const addBus = async (req, res) => {
    try {
        const { manufacturer, bus_number, bus_type, model_id } = req.body;

        if (!manufacturer || !bus_number || !bus_type || model_id === undefined) {
            return res.status(400).json({
                status: 400,
                msg: 'manufacturer, bus_number, bus_type, and model_id are required',
            });
        }

        if (isNaN(parseInt(model_id))) {
            return res.status(400).json({
                status: 400,
                msg: 'model_id must be a number',
            });
        }

        const request = {
            manufacturer,
            bus_number,
            bus_type,
            model_id: parseInt(model_id, 10),
        };

        client.AddBus(request, (err, response) => {
            if (err) {
                return res.status(500).json({
                    status: 500,
                    msg: err.message || 'gRPC service error',
                });
            }

            return res.status(response.status || 200).json({
                status: response.status,
                msg: response.msg,
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            msg: 'Internal server error',
        });
    }
};

const updateBus = async (req, res) => {
    try {
        const { bus } = req.body;

        if (!bus) {
            return res.status(400).json({
                status: 400,
                msg: 'bus object is required in the request body',
            });
        }

        const { id, manufacturer, bus_number, bus_type, model_id } = bus;

       

        const request = {
            bus: {
                id: parseInt(id, 10),
                manufacturer,
                bus_number,
                bus_type,
                model_id: parseInt(model_id, 10),
            },
        };

        client.UpdateBus(request, (err, response) => {
            if (err) {
                return res.status(500).json({
                    status: 500,
                    msg: err.message || 'gRPC service error',
                });
            }

            return res.status(response.status || 200).json({
                status: response.status,
                msg: response.msg,
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            msg: 'Internal server error',
        });
    }
};

const deleteBus = async (req, res) => {
    try {
        const { id, bus_number } = req.params; // You might use either id or bus_number

        // Since your proto uses `bus_number` for deletion, we'll validate that
        const busNum = bus_number || id; // fallback to id if path param is called :id

        if (!busNum) {
            return res.status(400).json({
                status: 400,
                msg: 'bus_number is required to delete a bus',
            });
        }

        const request = { bus_number: busNum };

        client.DeleteBus(request, (err, response) => {
            if (err) {
                return res.status(500).json({
                    status: 500,
                    msg: err.message || 'gRPC service error',
                });
            }

            return res.status(response.status || 200).json({
                status: response.status,
                msg: response.msg,
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            msg: 'Internal server error',
        });
    }
};

export { getBus, getBuses, addBus, updateBus, deleteBus };