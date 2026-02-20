import client from '../../grpc_clients/bus_service_client.js';

const getModels = (req, res) => {
    let { skip, limit } = req.params;
    if (skip === undefined || limit === undefined) {
        return res.status(400).json({
            msg: 'skip and limit are required'
        });
    }
    if (
        !Number.isInteger(Number(skip)) ||
        !Number.isInteger(Number(limit))
    ) {
        return res.status(400).json({
            msg: 'skip and limit must be integers'
        });
    }
    skip = Number(skip);
    limit = Number(limit);

    if (skip < 0) {
        return res.status(400).json({
            msg: 'skip cannot be negative'
        });
    }

    if (limit <= 0 || limit > 100) {
        return res.status(400).json({
            msg: 'limit must be between 1 and 100'
        });
    }

    client.GetModels(
        { skip, limit },
        (err, grpcResponse) => {
            if (err) {
                return res.status(500).json({
                    msg: 'gRPC error',
                    error: err.message
                });
            }

            return res.status(grpcResponse.status).json({
                msg: grpcResponse.msg,
                models: grpcResponse.models
            });
        }
    );
};

const getModel = (req, res) => {
    let { id } = req.params;

    if (id === undefined) {
        return res.status(400).json({
            msg: 'model id is required'
        });
    }

    if (!Number.isInteger(Number(id))) {
        return res.status(400).json({
            msg: 'model id must be a valid integer'
        });
    }

    id = Number(id);

    if (id <= 0) {
        return res.status(400).json({
            msg: 'model id must be greater than 0'
        });
    }

    client.GetModel(
        { model_id: id },
        (err, grpcResponse) => {
            if (err) {
                return res.status(500).json({
                    msg: 'gRPC error',
                    error: err.message
                });
            }

            return res.status(grpcResponse.status).json({
                msg: grpcResponse.msg,
                seats: grpcResponse.seats
            });
        }
    );
};

const addModel = (req, res) => {
    let { model_name } = req.body;

    if (model_name === undefined) {
        return res.status(400).json({
            msg: 'model_name is required'
        });
    }

    if (typeof model_name !== 'string') {
        return res.status(400).json({
            msg: 'model_name must be a string'
        });
    }

    model_name = model_name.trim();
    if (model_name.length === 0) {
        return res.status(400).json({
            msg: 'model_name cannot be empty'
        });
    }

    if (model_name.length < 2 || model_name.length > 100) {
        return res.status(400).json({
            msg: 'model_name must be between 2 and 100 characters'
        });
    }

    const nameRegex = /^[a-zA-Z0-9\- ]+$/;
    if (!nameRegex.test(model_name)) {
        return res.status(400).json({
            msg: 'model_name contains invalid characters'
        });
    }

    client.AddModel(
        { model_name },
        (err, grpcResponse) => {
            if (err) {
                return res.status(500).json({
                    msg: 'gRPC error',
                    error: err.message
                });
            }
            return res.status(grpcResponse.status).json({
                msg: grpcResponse.msg,
                model_id: grpcResponse.model_id
            });
        }
    );
};

export { getModel, getModels, addModel };