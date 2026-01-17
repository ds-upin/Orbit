const prisma = require('../prismaClient');
// Done
const addSeat = async (call, callback) => {
    const { seat_number, model_id } = call.request;

    if (!seat_number || model_id === undefined || typeof seat_number !== 'string' || typeof model_id !== 'number') {
        callback(null, {
            status: 400,
            msg: 'Seat Number or Model is incorrect.',
            seat_id: 0
        });
        return;
    }

    const trimmedSeat = seat_number.trim();

    try {
        const result = await prisma.$transaction(async (tx) => {
            const existing = await tx.$queryRaw`
                SELECT id FROM seats 
                WHERE seat_number = ${trimmedSeat} AND model_id = ${model_id}
            `;

            if (existing.length > 0) {
                return { id: existing[0].id, existed: true };
            }

            const inserted = await tx.$queryRaw`
                INSERT INTO seats (seat_number, model_id) 
                VALUES (${trimmedSeat}, ${model_id}) 
                RETURNING id
            `;

            return { id: inserted[0].id, existed: false };
        });

        if (result.id) {
            callback(null, {
                status: result.existed ? 200 : 201,
                msg: result.existed ? 'Seat already exists for this model' : 'Seat added successfully',
                seat_id: result.id
            });
        } else {
            callback(null, {
                status: 400,
                msg: 'Failed to add seat',
                seat_id: 0
            });
        }
    } catch (err) {
        console.error('addSeat error:', err);
        callback(null, {
            status: 500,
            msg: 'Internal Server Error',
            seat_id: 0
        });
    }
};


const deleteSeat = async (call, callback) => {
    const { model_id, seat_number } = call.request;
    callback(null, {
        status:500,
        msg: "Cannot delete seat",
    });
    return;
};

module.exports =  { addSeat, deleteSeat};
