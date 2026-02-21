import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';
import { createCheckoutSession } from '../createPayment.js';

/* 
   1. JWT data is signed by booking service.
   2. We will do initial verification for wrong/tampered payment against database present in booking service.
   3. Even if the payment succeeds, seats will not be booked without verification of amount from booking service.
*/

const InitiatePayment = async (call, callback) => {
    try {
        const { webtoken, name, email, user_id } = call.request;
        const secret = process.env.PAYMENT_JWT_SECRET;

        // Verify JWT
        const data = jwt.verify(webtoken, secret, {
            audience: 'payment',
            issuer: 'booking-service',
        });

        const { fare, departure_time, arrival_time, schedule_id, booking_group } = data;
        console.log(data);
 
        if (
            typeof fare !== 'number' ||
            typeof departure_time !== 'string' ||
            typeof arrival_time !== 'string' ||
            typeof schedule_id !== 'number' ||
            typeof booking_group !== 'number' ||
            fare <= 0
        ) {
            return callback(null, {
                status: 400,
                checkoutUrl: '',
                sessionId: '',
                message: 'Bad Request',
            });
        }

        // Fetch schedule by primary key
        const schedule = await prisma.schedules.findUnique({
            where: { id: schedule_id },
        });

        if (!schedule) {
            return callback(null, {
                status: 400,
                checkoutUrl: '',
                sessionId: '',
                message: 'Bad Request',
            });
        }

        // Validate schedule data
        if (
            schedule.departure_time.toISOString() !== departure_time ||
            schedule.arrival_time.toISOString() !== arrival_time ||
            schedule.fare < fare ||
            fare % schedule.fare !== 0
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

export { InitiatePayment };
