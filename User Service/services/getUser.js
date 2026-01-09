const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const getUser = async (call, callback) => {
    const { token } = call.request;

    const response = {
        name: "",
        email: "",
        number: 0,
        dob: "",
        success: false,
        message: "",
        status: 0,
        role: "",
        id: 0,
    };

    if (!token) {
        response.message = "Unauthorized";
        response.status = 401;
        return callback(null, response);
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "your_secret_key"
        );

        const userId = decoded.id;

        const result = await prisma.$queryRaw`
            SELECT 
                u.id,
                u.name,
                u.email,
                u.number,
                u.dob,
                r.role_type AS role
            FROM users u
            JOIN role r ON u.role = r.id
            WHERE u.id = ${userId} AND u.verified = TRUE
        `;

        if (result.length === 0) {
            response.message = "User not found";
            response.status = 404;
            return callback(null, response);
        }

        const user = result[0];

        response.success = true;
        response.message = "OK";
        response.status = 200;
        response.id = user.id || 0;
        response.name = user.name || "";
        response.email = user.email || "";
        response.number = user.number || 0;
        response.dob = user.dob || "";
        response.role = user.role || "";

        return callback(null, response);

    } catch (error) {
        if (
            error.name === "TokenExpiredError" ||
            error.name === "JsonWebTokenError"
        ) {
            response.message = "Unauthorized";
            response.status = 401;
            return callback(null, response);
        }

        console.error("Unexpected error:", error);
        response.message = "Internal Server Error";
        response.status = 500;
        return callback(null, response);
    }
};

module.exports = getUser;
