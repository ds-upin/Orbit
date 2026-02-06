const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const { createCheckoutSession } = require('../createPayment');

/* 
   1. JWT data is signed by booking service.
   2. We will do initial verification for wrong/tampered payment against database present in booking service.
   3. Even if the payment succeeds, seats will not be booked without verification of amount from booking service.
*/

const InitiatePayment = async (call, callback) => {
    try {
        const { webtoken, name, email, user_id } = call.request;
        const secret = process.env.PAYMENT_JWT_SECRET;

        const data = jwt.verify(webtoken, secret);
        const { fare, departure_time, arrival_time, schedule_id, booking_group } = data;

        if (
            typeof fare !== 'number' ||
            typeof departure_time !== 'string' ||
            typeof arrival_time !== 'string' ||
            typeof schedule_id !== 'number' ||
            typeof booking_group !=="numer" ||
            fare <= 0
        ) {
            return callback(null, {
                status: 400,
                checkoutUrl: '',
                sessionId: '',
                message: 'Bad Request',
            });
        }

        const result = await prisma.$queryRaw`
            SELECT * FROM schedules
            WHERE id = ${schedule_id}
            AND departure_time = ${departure_time}
            AND arrival_time = ${arrival_time}
        `;

        if (
            !result ||
            result.length === 0 ||
            result[0].fare < fare ||
            fare % result[0].fare !== 0
        ) {
            return callback(null, {
                status: 400,
                checkoutUrl: '',
                sessionId: '',
                message: 'Bad Request',
            });
        }

        // Create Checkout Session (amount in paise)
        const session = await createCheckoutSession({
            amount: fare * 100,
            schedule_id,
            name,
            email,
            booking_group,
            departure_time,
            arrival_time,
            user_id,
        });

        return callback(null, {
            status: 200,
            checkoutUrl: session.url,
            sessionId: session.id,
            message: 'Checkout Session Created',
        });

    } catch (err) {
        console.error('Error in initiating payment:', err);

        if (
            err.name === 'JsonWebTokenError' ||
            err.name === 'TokenExpiredError'
        ) {
            return callback(null, {
                status: 401,
                checkoutUrl: '',
                sessionId: '',
                message: 'Invalid or expired token',
            });
        }

        return callback(null, {
            status: 500,
            checkoutUrl: '',
            sessionId: '',
            message: 'Internal Server Error',
        });
    }
};

module.exports = { InitiatePayment };