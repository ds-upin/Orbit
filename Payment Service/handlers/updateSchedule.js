const prisma = require('../prismaClient');

const updateSchedule = async (data) => {
    const { status, schedule_details } = data;
    console.log(data);
    if (status === "created") {
        const {
            id,
            departure_time,
            arrival_time,
            fare,
        } = schedule_details;

        await prisma.$executeRaw`
            INSERT INTO schedules (
            id,
            fare,
            departure_time,
            arrival_time
        )
        VALUES (
        ${id},
        ${fare},
        ${departure_time},
        ${arrival_time}
        )
        `;

        return { success: true };
    }

    if (status === "deleted") {
        await prisma.$executeRaw`
        DELETE FROM schedules
        WHERE id = ${schedule_details.id};
        `;
        return { success: true };
    }

    if (status === "updated") {
        const {
            departure_time,
            arrival_time,
            fare,
        } = schedule_details;

        await prisma.$executeRaw`
      UPDATE schedules
      SET
        departure_time = ${departure_time},
        arrival_time = ${arrival_time},
        fare = ${fare}
      WHERE id = ${schedule_details.id};
    `;

        return { success: true };
    }
};

module.exports = { updateSchedule };
