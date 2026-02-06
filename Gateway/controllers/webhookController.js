const client = require('../grpc_clients/payment_client');

const stripe = require('../stripeClient');

const handleWebhook = async (req, res) => {
    let event;

    if (process.env.STRIPE_WEBHOOK_SECRET) {
        const signature = req.headers['stripe-signature'];

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );

            switch (event.type) {
                case 'checkout.session.completed':
                    try {
                        const session = event.data.object;
                        // console.log('Session ID:', session.id);
                        // console.log('PaymentIntent ID:', session.payment_intent);
                        // console.log('Payment status:', session.payment_status);
                        // console.log('Amount:', session.amount_total);
                        // console.log('Currency:', session.currency);
                        // console.log('Metadata:', session.metadata);
                        client.ConfirmPayment({
                            session_id: session.id.toString(),
                            amount: Number(session.amount_total),
                            metadata: {
                                user_id: Number(session.metadata.user_id),
                                schedule_id: Number(session.metadata.schedule_id),
                                departure_time: session.metadata.departure_time.toString(),
                                arrival_time: session.metadata.arrival_time.toString(),
                                name: session.metadata.name.toString(),
                                email: session.metadata.email.toString(),
                                booking_group: Number(session.metadata.booking_group),
                            }
                        }, (err, response) => {
                            if (err) {
                                return res.sendStatus(500);
                            }
                            if (response.status == 200) {
                                return res.json({ received: true });
                            }
                            return res.sendStatus(500);
                        });

                    } catch (err) {
                        console.error('Error handling checkout.session.completed:', err.message);
                        return res.sendStatus(500);
                    }
                    break;

                case 'checkout.session.async_payment_succeeded':
                    break;

                default:
                    console.log(`Unhandled event type ${event.type}`);
            }

            res.json({ received: true });

        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.sendStatus(400);
        }
    } else {
        console.error('STRIPE_WEBHOOK_SECRET is not set!');
        res.sendStatus(500);
    }
};

module.exports = { handleWebhook };