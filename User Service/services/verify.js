import prisma from '../prismaClient.js';

const verifyUser = async (call, callback) => {
    const { email, code } = call.request;

    try {
        const result = await prisma.$transaction(async (tx) => {
            const deletedCount = await tx.$executeRaw`
                DELETE FROM users
                WHERE verified = FALSE
                  AND created_at < NOW() - INTERVAL '5 minutes'
                  AND email = ${email}`;

            if (deletedCount > 0) {
                return {
                    success: false,
                    message: 'Verification code expired',
                    status: 400
                };
            }

            const users = await tx.$queryRaw`
                SELECT id FROM users
                WHERE email = ${email}
                  AND verification_code = ${code}
                  AND verified = FALSE
            `;

            if (users.length === 0) {
                return {
                    success: false,
                    message: 'Invalid verification code or user already verified',
                    status: 400
                };
            }

            await tx.$executeRaw`
                UPDATE users
                SET verified = TRUE
                WHERE id = ${users[0].id}`;

            return {

                success: true,
                message: 'User verified successfully',
                status: 200
            };
        });

        return callback(null, result);

    } catch (error) {
        console.error('Error during user verification:', error);

        return callback(null, {
            success: false,
            message: 'Error during verification',
            status: 500
        });
    }
};

export default verifyUser;
