const prisma = require('../prismaClient');
const { produceSchedule } = require('../producer/schedule.produce');

const addSchedule = async (call, callback) => {
    try {
        const {
            scheduled_date,
            departure_time,
            arrival_time,
            fare,
            bus_id,
            route_id
        } = call.request;

        if (!scheduled_date) {
            return callback(null, { status: 400, msg: "scheduled_date is required", scheduled_id: 0 });
        }

        if (!departure_time) {
            return callback(null, { status: 400, msg: "departure_time is required", scheduled_id: 0 });
        }

        if (!arrival_time) {
            return callback(null, { status: 400, msg: "arrival_time is required", scheduled_id: 0 });
        }

        if (new Date(departure_time) >= new Date(arrival_time)) {
            return callback(null, { status: 400, msg: "arrival_time must be after departure_time", scheduled_id: 0 });
        }

        if (!bus_id || isNaN(bus_id)) {
            return callback(null, { status: 400, msg: "Valid bus_id is required", scheduled_id: 0 });
        }

        if (!route_id || isNaN(route_id)) {
            return callback(null, { status: 400, msg: "Valid route_id is required", scheduled_id: 0 });
        }

        if (fare !== undefined && (isNaN(fare) || fare < 0)) {
            return callback(null, { status: 400, msg: "fare must be a non-negative number", scheduled_id: 0 });
        }

        const result = await prisma.$transaction(async (tx) => {

            const bus = await tx.buses.findUnique({
                where: {
                    id: bus_id,
                    deleted_at: null
                }
            });

            if (!bus) throw new Error("BUS_NOT_FOUND");

            const route = await tx.routes.findUnique({
                where: { id: route_id }
            });

            if (!route) throw new Error("ROUTE_NOT_FOUND");

            const newSchedule = await tx.schedules.create({
                data: {
                    scheduled_date: new Date(scheduled_date),
                    departure_time: new Date(departure_time),
                    arrival_time: new Date(arrival_time),
                    fare,
                    bus_id,
                    route_id
                }
            });

            return newSchedule;
        });
        await handleProducer(result.id, 'created');
        return callback(null, {
            status: 200,
            msg: "Schedule added successfully",
            scheduled_id: result.id
        });

    } catch (error) {
        if (error.message === "BUS_NOT_FOUND") {
            return callback(null, { status: 404, msg: "Bus not found", scheduled_id: 0 });
        }

        if (error.message === "ROUTE_NOT_FOUND") {
            return callback(null, { status: 404, msg: "Route not found", scheduled_id: 0 });
        }

        console.error("addSchedule error:", error);
        return callback(null, { status: 500, msg: "Internal server error", scheduled_id: 0 });
    }
};

const updateSchedule = async (call, callback) => {
    try {
        const {
            schedule_id,
            scheduled_date,
            departure_time,
            arrival_time,
            fare,
            bus_id,
            route_id,
            status
        } = call.request;

        if (!schedule_id || isNaN(schedule_id)) {
            return callback(null, { status: 400, msg: "Valid schedule_id is required" });
        }

        if (departure_time && arrival_time) {
            if (new Date(departure_time) >= new Date(arrival_time)) {
                return callback(null, { status: 400, msg: "arrival_time must be after departure_time" });
            }
        }

        if (fare !== undefined && (isNaN(fare) || fare < 0)) {
            return callback(null, { status: 400, msg: "fare must be a non-negative number" });
        }

        if (status !== undefined && typeof status !== "string") {
            return callback(null, { status: 400, msg: "status must be a string" });
        }

        if (bus_id !== undefined && isNaN(bus_id)) {
            return callback(null, { status: 400, msg: "bus_id must be a valid number" });
        }

        if (route_id !== undefined && isNaN(route_id)) {
            return callback(null, { status: 400, msg: "route_id must be a valid number" });
        }

        await prisma.$transaction(async (tx) => {

            const schedules = await tx.schedules.findUnique({
                where: {
                    id: schedule_id,
                    deleted_at: null,
                }
            });

            if (!schedules) throw new Error("SCHEDULE_NOT_FOUND");

            if (bus_id !== undefined) {
                const bus = await tx.buses.findUnique({ where: { id: bus_id, deleted_at: null } });
                if (!bus) throw new Error("BUS_NOT_FOUND");
            }

            if (route_id !== undefined) {
                const route = await tx.routes.findUnique({ where: { id: route_id } });
                if (!route) throw new Error("ROUTE_NOT_FOUND");
            }

            const updatedSchedule = {
                scheduled_date: scheduled_date ?? schedules.scheduled_date,
                departure_time: departure_time ?? schedules.departure_time,
                arrival_time: arrival_time ?? schedules.arrival_time,
                fare: fare ?? schedules.fare,
                bus_id: bus_id ?? schedules.bus_id,
                route_id: route_id ?? schedules.route_id,
                status: status ?? schedules.status
            };

            if (updatedSchedule.departure_time && updatedSchedule.arrival_time) {
                if (new Date(updatedSchedule.departure_time) >= new Date(updatedSchedule.arrival_time)) {
                    throw new Error("INVALID_TIME");
                }
            }

            await tx.schedules.update({
                where: {
                    id: schedule_id,
                    deleted_at: null,
                },
                data: updatedSchedule
            });
        });

        await handleProducer(schedule_id, 'updated');
        return callback(null, { status: 200, msg: "Schedule updated successfully" });

    } catch (error) {
        if (error.message === "SCHEDULE_NOT_FOUND") {
            return callback(null, { status: 404, msg: "Schedule not found" });
        }

        if (error.message === "BUS_NOT_FOUND") {
            return callback(null, { status: 404, msg: "Bus not found" });
        }

        if (error.message === "ROUTE_NOT_FOUND") {
            return callback(null, { status: 404, msg: "Route not found" });
        }

        if (error.message === "INVALID_TIME") {
            return callback(null, { status: 400, msg: "arrival_time must be after departure_time" });
        }

        console.error("updateSchedule error:", error);
        return callback(null, { status: 500, msg: "Internal server error" });
    }
};


const deleteSchedule = async (call, callback) => {
    try {
        const { scheduled_id } = call.request;

        if (!scheduled_id || isNaN(scheduled_id)) {
            return callback(null, { status: 400, msg: "Valid scheduled_id is required" });
        }

        const result = await prisma.$transaction(async (tx) => {

            const schedule = await tx.schedules.findFirst({
                where: { id: scheduled_id, deleted_at: null }
            });

            if (!schedule) throw new Error("SCHEDULE_NOT_FOUND");

            await tx.schedules.update({
                where: { id: scheduled_id },
                data: { deleted_at: new Date() }
            });

            return true;
        });
        await handleProducer(schedule_id, 'deleted');
        return callback(null, { status: 200, msg: "Schedule deleted successfully" });

    } catch (error) {

        if (error.message === "SCHEDULE_NOT_FOUND") {
            return callback(null, { status: 404, msg: "Schedule not found" });
        }

        console.error("deleteSchedule error:", error);
        return callback(null, { status: 500, msg: "Internal server error" });
    }
};

const getSchedule = async (call, callback) => {
    try {
        const { scheduled_id } = call.request;

        if (!scheduled_id || isNaN(scheduled_id)) {
            return callback(null, {
                status: 400,
                msg: "Valid scheduled_id is required",
                schedule: null
            });
        }

        const schedule = await prisma.schedules.findFirst({
            where: {
                id: scheduled_id,
                deleted_at: null
            }
        });

        if (!schedule) {
            return callback(null, {
                status: 404,
                msg: "Schedule not found",
                schedule: null
            });
        }

        return callback(null, {
            status: 200,
            msg: "Schedule fetched successfully",
            schedule: {
                schedule_id: schedule.id,
                scheduled_date: schedule.scheduled_date?.toISOString() || '',
                departure_time: schedule.departure_time?.toISOString() || '',
                arrival_time: schedule.arrival_time?.toISOString() || '',
                fare: schedule.fare || 0,
                bus_id: schedule.bus_id || 0,
                route_id: schedule.route_id || 0,
                status: schedule.status || ''
            }
        });

    } catch (error) {
        console.error("getSchedule error:", error);
        return callback(null, {
            status: 500,
            msg: "Internal server error",
            schedule: null
        });
    }
};

const getSchedules = async (call, callback) => {
    try {
        const { limit, skip } = call.request;

        const safeLimit = parseInt(limit) || 10;
        const safeSkip = parseInt(skip) || 0;

        if (safeLimit <= 0) {
            return callback(null, { status: 400, msg: "limit must be a positive number", schedules: [] });
        }

        if (safeSkip < 0) {
            return callback(null, { status: 400, msg: "skip must be >= 0", schedules: [] });
        }

        const schedules = await prisma.schedules.findMany({
            where: { deleted_at: null },
            skip: safeSkip,
            take: safeLimit,
            orderBy: { scheduled_date: 'asc' }
        });

        const formattedSchedules = schedules.map(s => ({
            schedule_id: s.id,
            scheduled_date: s.scheduled_date?.toISOString() || '',
            departure_time: s.departure_time?.toISOString() || '',
            arrival_time: s.arrival_time?.toISOString() || '',
            fare: s.fare || 0,
            bus_id: s.bus_id || 0,
            route_id: s.route_id || 0,
            status: s.status || ''
        }));

        return callback(null, {
            status: 200,
            msg: "Schedules fetched successfully",
            schedules: formattedSchedules
        });

    } catch (error) {
        console.error("getSchedules error:", error);
        return callback(null, {
            status: 500,
            msg: "Internal server error",
            schedules: []
        });
    }
};

const getScheduledBuses = async (call, callback) => {
    try {
        const { limit, skip } = call.request;

        const safeLimit = parseInt(limit) || 10;
        const safeSkip = parseInt(skip) || 0;

        if (safeLimit <= 0) {
            return callback(null, { status: 400, msg: "limit must be positive", schedules: [] });
        }

        if (safeSkip < 0) {
            return callback(null, { status: 400, msg: "skip must be >= 0", schedules: [] });
        }

        const schedules = await prisma.schedules.findMany({
            where: { deleted_at: null },
            skip: safeSkip,
            take: safeLimit,
            orderBy: { scheduled_date: 'asc' },
            include: {
                buses: {
                    select: {
                        id: true,
                        manufacturer: true,
                        bus_number: true,
                        bus_type: true,
                        model_id: true
                    }
                },
                routes: {
                    select: {
                        id: true,
                        source: true,
                        destination: true,
                        distance: true
                    }
                }
            }
        });

        const formatted = schedules.map(s => ({
            schedule_id: s.id,
            scheduled_date: s.scheduled_date?.toISOString() || '',
            departure_time: s.departure_time?.toISOString() || '',
            arrival_time: s.arrival_time?.toISOString() || '',
            fare: s.fare || 0,
            status: s.status || '',
            bus: s.buses ? {
                id: s.buses.id,
                manufacturer: s.buses.manufacturer || '',
                bus_number: s.buses.bus_number || '',
                bus_type: s.buses.bus_type || '',
                model_id: s.buses.model_id || 0
            } : null,
            route: s.routes ? {
                id: s.routes.id,
                source: s.routes.source || '',
                destination: s.routes.destination || '',
                distance: s.routes.distance || 0
            } : null
        }));

        return callback(null, {
            status: 200,
            msg: "Scheduled buses fetched successfully",
            schedules: formatted
        });

    } catch (error) {
        console.error("getScheduledBuses error:", error);
        return callback(null, {
            status: 500,
            msg: "Internal server error",
            schedules: []
        });
    }
};

const getScheduledBusesByRoute = async (call, callback) => {
    try {
        const { source, destination, limit, skip } = call.request;

        if (!source || !source.trim()) {
            return callback(null, { status: 400, msg: "source is required", schedules: [] });
        }

        if (!destination || !destination.trim()) {
            return callback(null, { status: 400, msg: "destination is required", schedules: [] });
        }

        const safeLimit = parseInt(limit) || 10;
        const safeSkip = parseInt(skip) || 0;

        if (safeLimit <= 0) {
            return callback(null, { status: 400, msg: "limit must be positive", schedules: [] });
        }

        if (safeSkip < 0) {
            return callback(null, { status: 400, msg: "skip must be >= 0", schedules: [] });
        }

        const routes = await prisma.routes.findMany({
            where: {
                source: source.trim(),
                destination: destination.trim()
            }
        });

        if (!routes.length) {
            return callback(null, { status: 404, msg: "No routes found", schedules: [] });
        }

        const routeIds = routes.map(r => r.id);

        const schedules = await prisma.schedules.findMany({
            where: {
                route_id: { in: routeIds },
                deleted_at: null
            },
            skip: safeSkip,
            take: safeLimit,
            orderBy: { scheduled_date: 'asc' },
            include: {
                buses: {
                    select: {
                        id: true,
                        manufacturer: true,
                        bus_number: true,
                        bus_type: true,
                        model_id: true
                    }
                },
                routes: true
            }
        });

        const formatted = schedules.map(s => ({
            schedule_id: s.id,
            scheduled_date: s.scheduled_date?.toISOString() || '',
            departure_time: s.departure_time?.toISOString() || '',
            arrival_time: s.arrival_time?.toISOString() || '',
            fare: s.fare || 0,
            status: s.status || '',
            bus: s.buses ? {
                id: s.buses.id,
                manufacturer: s.buses.manufacturer || '',
                bus_number: s.buses.bus_number || '',
                bus_type: s.buses.bus_type || '',
                model_id: s.buses.model_id || 0
            } : null,
            route: s.routes ? {
                id: s.routes.id,
                source: s.routes.source || '',
                destination: s.routes.destination || '',
                distance: s.routes.distance || 0
            } : null
        }));

        return callback(null, {
            status: 200,
            msg: "Scheduled buses fetched successfully",
            schedules: formatted
        });

    } catch (error) {
        console.error("getScheduledBusesByRoute error:", error);
        return callback(null, {
            status: 500,
            msg: "Internal server error",
            schedules: []
        });
    }
};

const handleProducer = async (schedule_id, status) => {
    if (status === "deleted") {
        await produceSchedule({ data: { status, schedule_id } });
        return;
    }
    const schedule = await prisma.schedules.findUnique({
        where: {
            id: schedule_id
        },
        include: {
            buses: {
                include: {
                    models: {
                        include: {
                            seats: {
                                select: { id: true }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!schedule) {
        throw new Error("SCHEDULE_NOT_FOUND");
    }

    const seat_ids = schedule.buses?.models?.seats.map(seat => seat.id) || [];
    const data = {
        status: status,
        schedule_details: schedule,
        seat_ids
    };
    await produceSchedule({ data });
    return;
};


module.exports = { getScheduledBusesByRoute, addSchedule, updateSchedule, deleteSchedule, getSchedule, getSchedules, getScheduledBuses };