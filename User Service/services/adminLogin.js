const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient'); // Your shared PrismaClient instance

const adminLogin = async (call, callback) => {
    const { email, password } = call.request;

    try {

        const result = await prisma.$queryRaw`
            SELECT u.id, u.email, u.name, u.password, r.role_type 
            FROM users u
            JOIN roles r ON u.role = r.id
            WHERE u.email = ${email} AND r.role_type = 'admin' AND u.verified = TRUE
        `;

        if (result.length === 0) {
            return callback(null, {
                success: false,
                token: '',
                message: 'Admin not found or wrong credentials',
                status: 404,
            });
        }

        const admin = result[0];  
        const passwordMatch = await bcrypt.compare(password, admin.password);

        if (!passwordMatch) {
            return callback(null, {
                success: false,
                token: '',
                message: 'Incorrect password',
                status: 401,
            });
        }

        const payload = {
            userId: admin.id,
            email: admin.email,
            name: admin.name,
            role: 'admin',
        };

        const secretKey = process.env.JWT_SECRET || 'your_secret_key'; 
        const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });  

        callback(null, {
            success: true,
            token: token,
            message: 'Admin login successful',
            status: 200,
        });
    } catch (error) {
        console.error('Error during admin login:', error);

        callback(null, {
            success: false,
            token: '',
            message: 'Internal server error',
            status: 500,
        });
    }
};

module.exports = adminLogin;
