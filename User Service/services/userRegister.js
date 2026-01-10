const bcrypt = require('bcrypt');
const prisma = require('../prismaClient');
const { produceEmailCode } = require('../producer');

function generateSixDigitNumber() {
    return Math.floor(100000 + Math.random() * 900000);
}

const userRegister = async (call, callback) => {
    const { name, email, number, dob, password } = call.request;
    const dobDate = new Date(dob);
    const verificationCode = generateSixDigitNumber();
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await prisma.$transaction(async (tx) => {
            await tx.$executeRaw`
            DELETE FROM users
            WHERE verified = FALSE
            AND email = ${email}
            `;
            
            const inserted = await tx.$queryRaw`
            INSERT INTO users
            (name, email, number, dob, password, verification_code, verified)
            VALUES (${name}, ${email}, ${number}, ${dobDate}, ${hashedPassword}, ${verificationCode}, FALSE)
            RETURNING id
            `;
            
            return inserted[0];
        });

        callback(null, {
            success: true,
            message: 'User registered successfully',
            user_id: result.id,
            status: 201,
        });
        await produceEmailCode(email, verificationCode, name);
    } catch (error) {
        console.error('Error during user registration:', error);
        if (error.code === 'P2002') {
            return callback(null, {
                success: false,
                message: 'Email already registered',
                status: 409,
            });
        }
        callback(null, {
            success: false,
            message: 'Error during registration',
            status: 500,
        });
    }
};

module.exports = userRegister;
