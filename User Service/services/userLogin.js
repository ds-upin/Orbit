const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const userLogin = async (call, callback) => {
    const { email, password } = call.request;

    try {
        const result = await prisma.$queryRaw`
            SELECT * FROM users WHERE email = ${email} AND verified = TRUE
        `;

        if (result.length === 0) {
            return callback(null, {
                success: false,
                token: '',
                message: 'User not found',
                status: 404,
            });
        }

        const user = result[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return callback(null, {
                success: false,
                token: '',
                message: 'Incorrect password',
                status: 401,
            });
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: 'user',
        };

        const secretKey = process.env.JWT_SECRET || 'your_secret_key';
        const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

        callback(null, {
            success: true,
            token: token,
            message: 'Login successful',
            status: 200,
        });
    } catch (error) {
        console.error('Error during user login:', error);

        callback(null, {
            success: false,
            token: '',
            message: 'Internal server error',
            status: 500,
        });
    }
};

module.exports = userLogin;
