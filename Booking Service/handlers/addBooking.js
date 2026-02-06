const prisma = require('../prismaClient');
const { Prisma } = require('../generated/prisma/client');

const addBooking = async (call, callback) => {
    const { user_id, schedule_id, seat_ids } = call.request;

    if (!user_id || !schedule_id || !Array.isArray(seat_ids) || seat_ids.length === 0) {
        return callback(null, {
            booking_id: 0,
            status: 400,
            msg: 'Invalid booking request'
        });
    }

    try {
        const bookingGroup = await prisma.$transaction(async (tx) => {

            const [schedule] = await tx.$queryRaw`
            SELECT seat_ids, fare
            FROM schedules
            WHERE id = ${schedule_id}
            AND deleted_at IS NULL
            LIMIT 1;
            `;

            if (!schedule) {
                throw { code: 'SCHEDULE_NOT_FOUND' };
            }

            const invalidSeats = seat_ids.filter(
                seatId => !schedule.seat_ids.includes(seatId)
            );

            if (invalidSeats.length > 0) {
                throw { code: 'INVALID_SEATS' };
            }

            await tx.$executeRaw`
            DELETE FROM seat_bookings sb
            USING bookings b
            WHERE sb.booking_group = b.booking_group
            AND b.schedule_id = ${schedule_id}
            AND b.status = 'LOCKED'
            AND b.expires_at < now();
            `;

            await tx.$executeRaw`
            DELETE FROM bookings
            WHERE schedule_id = ${schedule_id}
            AND status = 'LOCKED'
            AND expires_at < now();
            `;

            const amount = seat_ids.length * (schedule.fare || 0);

            const [booking] = await tx.$queryRaw`
            INSERT INTO bookings (user_id, schedule_id, amount)
            VALUES (${user_id}, ${schedule_id}, ${amount})
            RETURNING booking_group;
            `;

            await tx.$executeRaw`
            INSERT INTO seat_bookings (booking_group, schedule_id, seat_id)
            SELECT
            ${booking.booking_group},
            ${schedule_id},
            seat_id
            FROM UNNEST(${Prisma.join(seat_ids)}) AS seat_id;
            `;

            return booking.booking_group;
        });

        return callback(null, {
            booking_id: bookingGroup,
            status: 202,
            msg: 'Seats locked successfully. Proceed to payment.'
        });

    } catch (err) {
        if (err.code === 'INVALID_SEATS') {
            return callback(null, {
                booking_id: 0,
                status: 400,
                msg: 'One or more seats do not belong to this schedule'
            });
        }

        if (err.code === 'SCHEDULE_NOT_FOUND') {
            return callback(null, {
                booking_id: 0,
                status: 404,
                msg: 'Schedule not found or deleted'
            });
        }

        if (err.code === '23505') {
            return callback(null, {
                booking_id: 0,
                status: 409,
                msg: 'One or more seats are already locked or booked'
            });
        }

        console.error('AddBooking failed:', err);

        return callback(null, {
            booking_id: 0,
            status: 500,
            msg: 'Internal error while creating booking'
        });
    }
};

module.exports = { addBooking };
