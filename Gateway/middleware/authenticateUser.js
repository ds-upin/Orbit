const { status } = require('@grpc/grpc-js');
const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized', status: 401 });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Unauthorized', status: 401 });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'your_secret_key'
        );

        const { id, email, role, name } = decoded;

        if (!id || !email || !role) {
            return res.status(401).json({ message: 'Unauthorized', status: 401 });
        }

        req.token = token;
        req.user = {
            id,
            email,
            role,
            name,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorized', status: 401
        });
    }
};

module.exports = { authenticateUser };
