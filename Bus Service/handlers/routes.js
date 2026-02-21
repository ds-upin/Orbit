import prisma from '../prismaClient.js';

const addRoute = async (call, callback) => {
    const { source, destination, distance } = call.request;

    if (!source || !destination || distance === undefined || typeof source !== 'string' || typeof destination !== 'string' || typeof distance !== 'number') {
        callback(null, {
            route_id: 0,
            status: 400,
            msg: 'Source, destination, or distance is invalid'
        });
        return;
    }

    const trimmedSource = source.trim();
    const trimmedDestination = destination.trim();

    try {
        const result = await prisma.$transaction(async (tx) => {
            const existing = await tx.routes.findFirst({
                where: {
                    source: trimmedSource,
                    destination: trimmedDestination
                }
            });

            if (existing) {
                return { id: existing.id, existed: true };
            }

            const inserted = await tx.routes.create({
                data: {
                    source: trimmedSource,
                    destination: trimmedDestination,
                    distance
                }
            });

            return { id: inserted.id, existed: false };
        });

        if (result.id) {
            callback(null, {
                route_id: result.id,
                status: result.existed ? 200 : 201,
                msg: result.existed ? 'Route already exists' : 'Route added successfully'
            });
        } else {
            callback(null, {
                route_id: 0,
                status: 400,
                msg: 'Failed to add route'
            });
        }
    } catch (err) {
        console.error('addRoute error:', err);
        callback(null, {
            route_id: 0,
            status: 500,
            msg: 'Internal Server Error'
        });
    }
};

const getRoute = async (call, callback) => {
    const { route_id } = call.request;

    if (!route_id || typeof route_id !== 'number') {
        callback(null, {
            status: 400,
            msg: 'Invalid route_id',
            source: '',
            destination: '',
            distance: 0,
            route_id: 0
        });
        return;
    }

    try {
        const result = await prisma.$queryRaw`
            SELECT * FROM routes
            WHERE id = ${route_id}
        `;

        if (result[0]) {
            callback(null, {
                status: 200,
                msg: 'Route found',
                source: result[0].source,
                destination: result[0].destination,
                distance: result[0].distance,
                route_id: result[0].id
            });
        } else {
            callback(null, {
                status: 404,
                msg: 'Route not found',
                source: '',
                destination: '',
                distance: 0,
                route_id: 0
            });
        }
    } catch (err) {
        console.error('getRoute error:', err);
        callback(null, {
            status: 500,
            msg: 'Internal Server Error',
            source: '',
            destination: '',
            distance: 0,
            route_id: 0
        });
    }
};

export { addRoute, getRoute }