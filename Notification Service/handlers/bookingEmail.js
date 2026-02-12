const transporter = require('../mail/transporter');

const bookingEmail = async (message) => {
    try {
        const payload = JSON.parse(message.value.toString());

        const {
            name,
            email,
            session_id,
            arrival_time,
            departure_time,
            amount,
            schedule_id,
            booking_id,
            bus_number,
            source,
            destination,
            status,
        } = payload;

        if (status === 'success') {

            await transporter.sendMail({
                from: `"Orbit" <${process.env.SMTP_USER}>`,
                to: email,
                subject: 'Orbit - Booking Confirmed',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2 style="color: #2c3e50;">Booking Confirmed</h2>
                        
                        <p>Hi <strong>${name}</strong>,</p>

                        <p>Your booking has been successfully confirmed. Here are your trip details:</p>

                        <hr/>

                        <p><strong>Booking ID:</strong> ${booking_id}</p>
                        <p><strong>Bus Number:</strong> ${bus_number}</p>
                        <p><strong>Route:</strong> ${source} → ${destination}</p>
                        <p><strong>Departure:</strong> ${departure_time}</p>
                        <p><strong>Arrival:</strong> ${arrival_time}</p>
                        <p><strong>Amount Paid:</strong> ₹${amount}</p>

                        <hr/>

                        <p>Thank you for choosing <strong>Orbit</strong>. Have a safe journey!</p>

                        <p style="font-size: 12px; color: gray;">
                            Session ID: ${session_id} | Schedule ID: ${schedule_id}
                        </p>
                    </div>
                `,
            });

        } else {

            await transporter.sendMail({
                from: `"Orbit" <${process.env.SMTP_USER}>`,
                to: email,
                subject: 'Orbit - Payment Update',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2 style="color: #c0392b;">Payment Unsuccessful</h2>
                        
                        <p>Hi <strong>${name}</strong>,</p>

                        <p>
                            We received your payment attempt of <strong>₹${amount}</strong>, 
                            but unfortunately the booking could not be completed.
                        </p>

                        <p>
                            If any amount has been deducted from your account, 
                            it will be automatically refunded within 5-7 business days.
                        </p>

                        <p>
                            No booking has been created for this transaction.
                        </p>

                        <hr/>

                        <p style="font-size: 12px; color: gray;">
                            Session ID: ${session_id}
                        </p>

                        <p>
                            If you continue to face issues, please try again or contact our support team.
                        </p>

                        <p>
                            Thank you for choosing <strong>Orbit</strong>.
                        </p>
                    </div>
                `,
            });
        }

        console.log(`Booking email sent to ${email}`);

    } catch (error) {
        console.error('Error sending booking email:', error);
    }
};

module.exports = { bookingEmail };
