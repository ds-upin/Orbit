const prisma = require('../prismaClient');

function getFareForSchedule(schedule) {
    return schedule.fare;
}

const verifyPayment = async (data) => {
    const { session_id, amount, metadata } = data;
    const { user_id, schedule_id, booking_group } = metadata;

    try {
        await prisma.$transaction(async (tx) => {
            const booking = await tx.bookings.findUnique({
                where: { booking_group: Number(booking_group) },
                include: { seat_bookings: true },
            });

            if (!booking) {
                throw new Error("BOOKING_NOT_FOUND");
            }

            if (booking.user_id !== Number(user_id)) {
                throw new Error("USER_BOOKING_MISMATCH");
            }

            if (booking.schedule_id !== Number(schedule_id)) {
                throw new Error("SCHEDULE_MISMATCH");
            }

            const seats = booking.seat_bookings;
            if (!seats.length) {
                throw new Error("NO_SEATS_BOOKED");
            }

            if (seats.some((s) => s.schedule_id !== booking.schedule_id)) {
                throw new Error("SEAT_SCHEDULE_MISMATCH");
            }

            const schedule = await tx.schedules.findUnique({
                where: { id: booking.schedule_id },
            });

            if (!schedule || schedule.status === "CANCELLED") {
                throw new Error("INVALID_SCHEDULE");
            }

            const expectedAmount = getFareForSchedule(schedule) * seats.length;

            if (Number(amount) !== expectedAmount) {
                throw new Error("AMOUNT_MISMATCH");
            }

            if (booking.payment_id) {
                return { success: true, reason: "ALREADY_CONFIRMED" };
            }

            const updateResult = await tx.bookings.updateMany({
                where: { booking_group: booking.booking_group, },
                data: {
                    status: "CONFIRMED",
                    amount: expectedAmount,
                    payment_id: Number(session_id),
                },
            });

            if (updateResult.count !== 1) {
                throw new Error("BOOKING_DELETED_OR_UPDATED_CONCURRENTLY");
            }
        });

        return { success: true };
    } catch (err) {
        try {
            await prisma.faulty_payment.create({
                data: {
                    booking_group: Number(booking_group) || null,
                    user_id: Number(user_id) || null,
                    schedule_id: Number(schedule_id) || null,
                    payment_id: Number(session_id) || null,
                },
            });
        } catch (logErr) {
            console.error("FAULTY PAYMENT LOG FAILED:", logErr);
        }

        return { success: false, reason: err.message };
    }
};

module.exports = { verifyPayment };
