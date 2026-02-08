const client = require('../../grpc_clients/bus_service_client');

const getSchedule = async (req, res) => {
    try {
        const { id } = req.params;

        const schedule_id = parseInt(id, 10);
        if (isNaN(schedule_id) || schedule_id <= 0) {
            return res.status(400).json({
                status: 400,
                msg: 'Invalid schedule id',
            });
        }

        const request = { schedule_id };

        client.GetSchedule(request, (err, response) => {
            if (err) {
                return res.status(500).json({
                    status: 500,
                    msg: err.message || 'gRPC service error',
                });
            }

            return res.status(response.status || 200).json({
                status: response.status,
                data: {
                    schedule_id: response.schedule_id,
                    scheduled_date: response.scheduled_date,
                    departure_time: response.departure_time,
                    arrival_time: response.arrival_time,
                    fare: response.fare,
                    bus_id: response.bus_id,
                    route_id: response.route_id,
                    status: response.status,
                },
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            msg: 'Internal server error',
        });
    }
};

const getSchedules = async (req, res) => {
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

        client.GetSchedules(request, (err, response) => {
            if (err) {
                return res.status(500).json({
                    status: 500,
                    msg: err.message || 'gRPC service error',
                });
            }

            return res.status(response.status || 200).json({
                status: response.status,
                msg: response.msg,
                schedules: response.schedules || [],
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            msg: 'Internal server error',
        });
    }
};

const updateSchedule = async (req, res) => {
    try {
        const {
            scheduled_date,
            departure_time,
            arrival_time,
            fare,
            bus_id,
            route_id,
            status,
            schedule_id,
        } = req.body;

        if (
            !scheduled_date ||
            !departure_time ||
            !arrival_time ||
            fare === undefined ||
            !bus_id ||
            !route_id ||
            !status
        ) {
            return res.status(400).json({
                status: 400,
                msg: 'All fields are required',
            });
        }

        if (
            isNaN(parseInt(fare)) ||
            isNaN(parseInt(bus_id)) ||
            isNaN(parseInt(route_id))
        ) {
            return res.status(400).json({
                status: 400,
                msg: 'fare, bus_id and route_id must be numbers',
            });
        }

        const request = {
            scheduled_date,
            departure_time,
            arrival_time,
            fare: parseInt(fare, 10),
            bus_id: parseInt(bus_id, 10),
            route_id: parseInt(route_id, 10),
            status,
            schedule_id,
        };

        client.UpdateSchedule(request, (err, response) => {
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

const deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;

        const schedule_id = parseInt(id, 10);
        if (isNaN(schedule_id) || schedule_id <= 0) {
            return res.status(400).json({
                status: 400,
                msg: 'Invalid schedule id',
            });
        }

        const request = { schedule_id };

        client.DeleteSchedule(request, (err, response) => {
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

const getScheduledBuses = async (req, res) => {
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

        client.GetScheduledBuses(request, (err, response) => {
            if (err) {
                return res.status(500).json({
                    status: 500,
                    msg: err.message || 'gRPC service error',
                });
            }
            return res.status(response.status || 200).json({
                status: response.status,
                msg: response.msg,
                schedules: response.schedules || [],
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            msg: 'Internal server error',
        });
    }
};

const getScheduledBusesByRoute = async (req, res) => {
    try {
        let { source, destination, limit, skip } = req.query;

        if (!source || !destination) {
            return res.status(400).json({
                status: 400,
                msg: 'source and destination are required',
            });
        }

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

        const request = {
            source,
            destination,
            limit,
            skip,
        };

        client.GetScheduledBusesByRoute(request, (err, response) => {
            if (err) {
                return res.status(500).json({
                    status: 500,
                    msg: err.message || 'gRPC service error',
                });
            }

            return res.status(response.status || 200).json({
                status: response.status,
                msg: response.msg,
                schedules: response.schedules || [],
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            msg: 'Internal server error',
        });
    }
};

const addSchedule = async (req, res) => {
    try {
        const {
            scheduled_date,
            departure_time,
            arrival_time,
            fare,
            bus_id,
            route_id
        } = req.body;

        if (
            !scheduled_date ||
            !departure_time ||
            !arrival_time ||
            bus_id === undefined ||
            route_id === undefined
        ) {
            return res.status(400).json({
                status: 400,
                msg: "Missing required fields"
            });
        }

        const grpcPayload = {
            scheduled_date,  
            departure_time,  
            arrival_time,     
            fare,             
            bus_id: Number(bus_id),
            route_id: Number(route_id)
        };

        client.AddSchedule(grpcPayload, (err, response) => {
            if (err) {
                console.error("gRPC error:", err);
                return res.status(500).json({
                    status: 500,
                    msg: "Service unavailable"
                });
            }
            console.log(response)
            return res.status(response.status).json(response);
        });

    } catch (error) {
        console.error("addScheduleController error:", error);
        return res.status(500).json({
            status: 500,
            msg: "Internal server error"
        });
    }
};


module.exports = {
    getSchedule,
    getSchedules,
    getScheduledBuses,
    getScheduledBusesByRoute,
    updateSchedule,
    deleteSchedule,
    addSchedule,
};