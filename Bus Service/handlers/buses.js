const prisma = require('../prismaClient');   

const getBus = async (call, callback) => {
    try {
        const { bus_number } = call.request;

        if (!bus_number || bus_number.trim().length===0) {
            return callback(null, {
                status: 400,
                msg: "bus_number is required",
                bus: null
            });
        }

        const result = await prisma.$queryRaw`
            SELECT id, manufacturer, bus_number, bus_type, model_id
            FROM buses
            WHERE bus_number = ${bus_number.trim()}
              AND deleted_at IS NULL
            LIMIT 1
        `;

        if (!result || result.length === 0) {
            return callback(null, {
                status: 404,
                msg: "Bus not found",
                bus: null
            });
        }

        const bus = result[0];

        return callback(null, {
            status: 200,
            msg: "Success",
            bus: {
                id: bus.id,
                manufacturer: bus.manufacturer,
                bus_number: bus.bus_number,
                bus_type: bus.bus_type,
                model_id: bus.model_id
            }
        });

    } catch (error) {
        console.error("getBus error:", error);
        return callback(null, {
            status: 500,
            msg: "Internal server error",
            bus: null
        });
    }
};

const getBuses = async (call, callback) => {
    try {
        let { limit, skip } = call.request;
        limit = limit && limit > 0 ? limit : 10;
        skip = skip && skip >= 0 ? skip : 0;

        const buses = await prisma.$queryRaw`
            SELECT 
                id,
                manufacturer,
                bus_number,
                bus_type,
                model_id
            FROM buses
            WHERE deleted_at IS NULL
            ORDER BY id DESC
            LIMIT ${limit}
            OFFSET ${skip}
        `;

        return callback(null, {
            status: 200,
            msg: "Success",
            buses: buses.map(bus => ({
                id: bus.id,
                manufacturer: bus.manufacturer,
                bus_number: bus.bus_number,
                bus_type: bus.bus_type,
                model_id: bus.model_id
            }))
        });

    } catch (error) {
        console.error("getBuses error:", error);
        return callback(null, {
            status: 500,
            msg: "Internal server error",
            buses: []
        });
    }
};

const addBus = async (call, callback) => {
    try {
        const { manufacturer, bus_number, bus_type, model_id } = call.request;

        // Validate input
        if (
            !manufacturer ||
            !bus_number ||
            !bus_type ||
            !model_id ||
            typeof manufacturer !== 'string' ||
            typeof bus_number !== 'string' ||
            typeof bus_type !== 'string' ||
            typeof model_id !== 'number' ||
            manufacturer.trim().length === 0 ||
            bus_number.trim().length === 0 ||
            bus_type.trim().length === 0
        ) {
            return callback(null, {
                status: 400,
                msg: "manufacturer, bus_number, bus_type and model_id are required"
            });
        }

        const trimmedManufacturer = manufacturer.trim();
        const trimmedBusNumber = bus_number.trim();
        const trimmedBusType = bus_type.trim();

        // Atomic transaction
        const result = await prisma.$transaction(async (tx) => {
            const inserted = await tx.$queryRaw`
                INSERT INTO buses (manufacturer, bus_number, bus_type, model_id, created_at)
                SELECT ${trimmedManufacturer}, ${trimmedBusNumber}, ${trimmedBusType}, ${model_id}, NOW()
                WHERE NOT EXISTS (
                    SELECT 1 FROM buses
                    WHERE bus_number = ${trimmedBusNumber} AND deleted_at IS NULL
                )
                AND EXISTS (
                    SELECT 1 FROM models
                    WHERE id = ${model_id}
                )
                RETURNING id
            `;
            return inserted;
        });

        if (result.length === 0) {
            return callback(null, {
                status: 409,
                msg: "Either bus number already exists or model_id does not exist"
            });
        }

        return callback(null, {
            status: 200,
            msg: "Bus added successfully"
        });

    } catch (error) {
        console.error("addBus error:", error);
        return callback(null, {
            status: 500,
            msg: "Internal server error"
        });
    }
};

const updateBus = async (call, callback) => {
    try {
        const { bus } = call.request;

        if (!bus || !bus.id || bus.id <= 0) {
            return callback(null, {
                status: 400,
                msg: "Valid bus.id is required"
            });
        }

        if (bus.manufacturer !== undefined) {
            if (typeof bus.manufacturer !== "string" || bus.manufacturer.trim() === "") {
                return callback(null, {
                    status: 400,
                    msg: "manufacturer must be a non-empty string"
                });
            }
        }

        if (bus.bus_number !== undefined) {
            if (typeof bus.bus_number !== "string" || bus.bus_number.trim() === "") {
                return callback(null, {
                    status: 400,
                    msg: "bus_number must be a non-empty string"
                });
            }
        }

        if (bus.bus_type !== undefined) {
            if (typeof bus.bus_type !== "string") {
                return callback(null, {
                    status: 400,
                    msg: "bus_type must be a string"
                });
            }
        }

        if (bus.model_id !== undefined) {
            if (typeof bus.model_id !== "number" || isNaN(bus.model_id)) {
                return callback(null, {
                    status: 400,
                    msg: "model_id must be a valid number"
                });
            }
        }

        await prisma.$transaction(async (tx) => {

            const rows = await tx.$queryRaw`
                SELECT id, manufacturer, bus_number, bus_type, model_id
                FROM buses
                WHERE id = ${bus.id} AND deleted_at IS NULL
            `;

            if (rows.length === 0) {
                throw new Error("NOT_FOUND");
            }

            const existing = rows[0];

            const updatedBus = {
                manufacturer: bus.manufacturer ?? existing.manufacturer,
                bus_number:   bus.bus_number   ?? existing.bus_number,
                bus_type:     bus.bus_type     ?? existing.bus_type,
                model_id:     bus.model_id     ?? existing.model_id
            };

            if (!updatedBus.manufacturer || updatedBus.manufacturer.trim() === "") {
                throw new Error("INVALID_MANUFACTURER");
            }
            if (!updatedBus.bus_number || updatedBus.bus_number.trim() === "") {
                throw new Error("INVALID_BUS_NUMBER");
            }

            const duplicate = await tx.$queryRaw`
                SELECT id FROM buses
                WHERE bus_number = ${updatedBus.bus_number}
                  AND id != ${bus.id}
                  AND deleted_at IS NULL
            `;

            if (duplicate.length > 0) {
                throw new Error("DUPLICATE");
            }

            await tx.$executeRaw`
                UPDATE buses
                SET
                    manufacturer = ${updatedBus.manufacturer.trim()},
                    bus_number   = ${updatedBus.bus_number.trim()},
                    bus_type     = ${updatedBus.bus_type.trim()},
                    model_id     = ${updatedBus.model_id}
                WHERE id = ${bus.id}
            `;
        });

        return callback(null, {
            status: 200,
            msg: "Bus updated successfully"
        });

    } catch (error) {

        if (error.message === "NOT_FOUND") {
            return callback(null, { status: 404, msg: "Bus not found" });
        }
        if (error.message === "DUPLICATE") {
            return callback(null, { status: 409, msg: "Bus number already exists" });
        }
        if (error.message === "INVALID_MANUFACTURER" || error.message === "INVALID_BUS_NUMBER") {
            return callback(null, { status: 400, msg: "Invalid bus data" });
        }

        console.error("updateBus error:", error);
        return callback(null, { status: 500, msg: "Internal server error" });
    }
};

const deleteBus = async (call, callback) => {
    try {
        const { bus_number } = call.request;

        if (!bus_number || bus_number.trim() === "") {
            return callback(null, {
                status: 400,
                msg: "bus_number is required"
            });
        }

        const result = await prisma.$executeRaw`
            UPDATE buses
            SET deleted_at = NOW()
            WHERE bus_number = ${bus_number.trim()}
              AND deleted_at IS NULL
        `;

        if (result === 0) {
            return callback(null, {
                status: 404,
                msg: "Bus not found"
            });
        }

        return callback(null, {
            status: 200,
            msg: "Bus deleted successfully"
        });

    } catch (error) {
        console.error("deleteBus error:", error);
        return callback(null, {
            status: 500,
            msg: "Internal server error"
        });
    }
};

module.exports = { getBus, getBuses, addBus, updateBus, deleteBus };