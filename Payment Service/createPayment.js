import stripe from './stripeClient.js';

const createCheckoutSession = async ({
    amount,
    schedule_id,
    departure_time,
    arrival_time,
    user_id,
    name,
    email,
    booking_group,
    currency = 'inr',
}) => {
    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],

            line_items: [
                {
                    price_data: {
                        currency,
                        product_data: {
                            name: 'Ticket Payment',
                        },
                        unit_amount: amount, 
                    },
                    quantity: 1,
                },
            ],

            // Used later in webhook
            metadata: {
                schedule_id: schedule_id.toString(),
                departure_time: departure_time.toString(),
                arrival_time: arrival_time.toString(),
                amount: amount.toString(),
                user_id: user_id.toString(),
                name: name.toString(),
                email: email.toString(),
                booking_group: booking_group.toString()
            },

            expires_at: Math.floor(Date.now() / 1000) + 4 * 60,
            success_url: 'http://localhost:3000/success',
            cancel_url: 'http://localhost:3000/cancel',
        });

        return session;
    } catch (err) {
        console.error('Stripe Error:', err);
        throw err;
    }
};

export { createCheckoutSession };
