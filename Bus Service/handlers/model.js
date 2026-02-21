import prisma from '../prismaClient.js';

const getModels = async (call, callback) => {
    const { limit, skip } = call.request;

    const validLimit = typeof limit === 'number' && limit > 0 ? limit : 10;
    const validSkip = typeof skip === 'number' && skip >= 0 ? skip : 0;

    try {
        const result = await prisma.$queryRaw`
            SELECT id AS model_id, model_name
            FROM models
            ORDER BY id
            LIMIT ${validLimit} OFFSET ${validSkip}
        `;

        const models = result.map(m => ({
            model_id: m.model_id,
            model_name: m.model_name
        }));

        callback(null, {
            status: 200,
            msg: 'Models fetched successfully',
            models
        });

    } catch (err) {
        console.error('getModels error:', err);
        callback(null, {
            status: 500,
            msg: 'Internal Server Error',
            models: []
        });
    }
};

const getModel = async (call, callback) => {
    const { model_id } = call.request; 
    
    if (!model_id || typeof model_id !== 'number') {
        callback(null, {
            status: 400,
            msg: 'Invalid model_id',
            model_name:'',
            seats: []
        });
        return;
    }

    try {
        const result = await prisma.$queryRaw`
            SELECT id, seat_number
            FROM seats
            WHERE model_id = ${model_id}
        `;

        const seats = result.map(seat => ({
            seat_id: seat.id,
            seat_name: seat.seat_number
        }));

        callback(null, {
            status: 200,
            msg: 'Seats fetched successfully',
            seats
        });

    } catch (err) {
        console.error('getModel error:', err);
        callback(null, {
            status: 500,
            msg: 'Internal Server Error',
            seats: []
        });
    }
};

const addModel = async (call, callback) => {
    const { model_name } = call.request; 

    if (!model_name || typeof model_name !== 'string') {
        callback(null, {
            status: 400,
            msg: 'Invalid model name',
            model_id: 0
        });
        return;
    }

    try {
        const result = await prisma.$queryRaw`
            INSERT INTO models (model_name, created_at)
            VALUES (${model_name}, NOW())
            RETURNING id
        `;

        if (result[0] && result[0].id) {
            callback(null, {
                status: 201,
                msg: 'Model added successfully',
                model_id: result[0].id
            });
        } else {
            callback(null, {
                status: 400,
                msg: 'Failed to add model',
                model_id: 0
            });
        }
    } catch (err) {
        console.error('addModel error:', err);
        callback(null, {
            status: 500,
            msg: 'Internal Server Error',
            model_id: 0
        });
    }
};

export { getModels, getModel, addModel };