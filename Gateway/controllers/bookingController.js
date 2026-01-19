const client = require('../grpc_clients/booking_client');

const initiateBooking = (req, res) => {
    const { user_id, schedule_id, seat_ids } = req.body;
    
    if (user_id === undefined || schedule_id === undefined || seat_ids === undefined) {
        return res.status(400).json({
            message: 'user_id, schedule_id, and seat_ids are required'
        });
    }

    if (typeof user_id !== 'number' || !Number.isInteger(user_id) || user_id <= 0) {
        return res.status(400).json({
            message: 'user_id must be a positive integer'
        });
    }

    if (typeof schedule_id !== 'number' || !Number.isInteger(schedule_id) || schedule_id <= 0) {
        return res.status(400).json({
            message: 'schedule_id must be a positive integer'
        });
    }

    if (!Array.isArray(seat_ids) || seat_ids.length === 0) {
        return res.status(400).json({
            message: 'seat_ids must be a non-empty array'
        });
    }

    for (const seatId of seat_ids) {
        if (typeof seatId !== 'number' || !Number.isInteger(seatId) || seatId <= 0) {
            return res.status(400).json({
                message: 'each seat_id must be a positive integer'
            });
        }
    }

    client.AddBooking(
        { user_id, schedule_id, seat_ids },
        (err, response) => {
            if (err) {
                console.error('gRPC error:', err);
                return res.status(500).json({
                    message: 'Booking service unavailable'
                });
            }

            return res.status(response.status).json({
                booking_id: response.booking_id,
                message: response.msg
            });
        }
    );
};

module.exports = { initiateBooking };
