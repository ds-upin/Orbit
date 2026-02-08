const prisma = require('../prismaClient');

const updateSchedule = async (data) => {
    const { status, schedule_details, seat_ids } = data;
    console.log("2", data);
    if (status === "created") {
        const {
            id,
            scheduled_date,
            departure_time,
            arrival_time,
            created_at,
            deleted_at,
            fare,
        } = schedule_details;

        await prisma.$executeRaw`
      INSERT INTO schedules (
        id,
        scheduled_date,
        departure_time,
        arrival_time,
        status,
        created_at,
        fare,
        seat_ids
      )
      VALUES (
        ${id},
        ${scheduled_date},
        ${departure_time},
        ${arrival_time},
        ${schedule_details.status},
        ${created_at},
        ${fare},
        ${seat_ids}
      );
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
            scheduled_date,
            departure_time,
            arrival_time,
            deleted_at,
            fare,
        } = schedule_details;

        await prisma.$executeRaw`
      UPDATE schedules
      SET
        scheduled_date = ${scheduled_date},
        departure_time = ${departure_time},
        arrival_time = ${arrival_time},
        status = ${schedule_details.status},
        deleted_at = ${deleted_at},
        seat_ids = ${seat_ids},
        fare = ${fare}
      WHERE id = ${schedule_details.id}
    `;

        return { success: true };
    }
};

module.exports = { updateSchedule };
