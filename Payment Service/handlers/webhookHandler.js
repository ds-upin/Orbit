import prisma from '../prismaClient.js';
import { paymentDataVerification } from '../producer/paymentVerification.js';

const ConfirmPayment = async (call, callback) => {
    try {
        const {
            session_id, //session.id.toString()
            amount, //Number(session.amount_total)
            metadata,
        } = call.request;
        const {
            user_id, //Number(session.metadata.user_id)
            schedule_id, //Number(session.metadata.schedule_id)
            departure_time, //session.metadata.departure_time.toString()
            arrival_time, //session.metadata.arrival_time.toString()
            name, //session.metadata.name.toString()
            email, //session.metadata.email.toString()
            booking_group, // 
        } = metadata;
        const result = await prisma.$executeRaw`
            INSERT INTO payments (amount, payment_method, payment_status, transaction_ref, paid_at)
            VALUES (${amount}, ${'CARD'}, ${'PAID'},${session_id},${(new Date).toISOString()})
        `;

        await paymentDataVerification(call.request);

        callback(null, {
            status: 200,
            msg: "Sucessfully updated the status",
        })
    } catch (err) {

    }
};

export { ConfirmPayment };