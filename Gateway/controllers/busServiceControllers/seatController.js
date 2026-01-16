const client = require('../../grpc_clients/bus_service_client');

const addSeat = async (req, res) => {
    let { seat_number, model_id } = req.body;

    if (seat_number === undefined || model_id === undefined) {
        return res.status(400).json({
            msg: 'seat_number and model_id are required'
        });
    }

    if (typeof seat_number !== 'string') {
        return res.status(400).json({
            msg: 'seat_number must be a string'
        });
    }

    seat_number = seat_number.trim();
    if (seat_number.length === 0) {
        return res.status(400).json({
            msg: 'seat_number cannot be empty'
        });
    }

    if (seat_number.length > 10) {
        return res.status(400).json({
            msg: 'seat_number cannot exceed 10 characters'
        });
    }

    const seatRegex = /^[A-Z0-9\-]+$/i; // e.g., "A1", "B-10"
    if (!seatRegex.test(seat_number)) {
        return res.status(400).json({
            msg: 'seat_number contains invalid characters'
        });
    }

    if (!Number.isInteger(Number(model_id)) || Number(model_id) <= 0) {
        return res.status(400).json({
            msg: 'model_id must be a positive integer'
        });
    }

    model_id = Number(model_id);

    client.AddSeat(
        { seat_number, model_id },
        (err, grpcResponse) => {
            if (err) {
                return res.status(500).json({
                    msg: 'gRPC error',
                    error: err.message
                });
            }

            return res.status(grpcResponse.status).json({
                msg: grpcResponse.msg,
                seat_id: grpcResponse.seat_id
            });
        }
    );
};

const deleteSeat = async (req, res) => {
    let { model_id, seat_number } = req.body;

    if (model_id === undefined || seat_number === undefined) {
        return res.status(400).json({
            msg: 'model_id and seat_number are required'
        });
    }

    if (!Number.isInteger(Number(model_id)) || Number(model_id) <= 0) {
        return res.status(400).json({
            msg: 'model_id must be a positive integer'
        });
    }
    model_id = Number(model_id);

    if (typeof seat_number !== 'string') {
        return res.status(400).json({
            msg: 'seat_number must be a string'
        });
    }

    seat_number = seat_number.trim();
    if (seat_number.length === 0) {
        return res.status(400).json({
            msg: 'seat_number cannot be empty'
        });
    }

    if (seat_number.length > 10) {
        return res.status(400).json({
            msg: 'seat_number cannot exceed 10 characters'
        });
    }

    const seatRegex = /^[A-Z0-9\-]+$/i; // e.g., "A1", "B-10"
    if (!seatRegex.test(seat_number)) {
        return res.status(400).json({
            msg: 'seat_number contains invalid characters'
        });
    }

    client.DeleteSeat(
        { model_id, seat_number },
        (err, grpcResponse) => {
            if (err) {
                return res.status(500).json({
                    msg: 'gRPC error',
                    error: err.message
                });
            }

            return res.status(grpcResponse.status).json({
                msg: grpcResponse.msg
            });
        }
    );
};

module.exports = { addSeat, deleteSeat };