import client from '../grpc_clients/user_client.js';

const loginUser = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    client.userLogin({ email, password }, (err, response) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(response);
    });
};

const registerUser = (req, res) => {
    const { name, email, number, dob, password } = req.body;
    if (!name || !email || !number || !dob || !password) 
        return res.status(400).json({ message: 'All fields are required' });

    if (!/^\d{7,15}$/.test(number)) return res.status(400).json({ message: 'Invalid number' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return res.status(400).json({ message: 'Invalid dob format, use YYYY-MM-DD' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    client.userRegister({ name, email, number: Number(number), dob, password }, (err, response) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(response); 
    });
};

const getUserProfile = (req, res) => {
    const { user, token } = req;

    if (!user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!client.getUser) {
        return res.status(501).json({ message: 'Not Implemented' });
    }

    client.getUser({ token }, (err, response) => {
        if (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        return res.status(response.status || 200).json(response);
    });
};

const verifyUser = (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: 'Email and code required' });
    client.verifyUser({ email, code }, (err, response) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(response.status).json(response);
    })
};

const loginAdmin = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    client.adminLogin({ email, password }, (err, response) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(response.status).json(response);
    });
};

export { loginUser, registerUser, getUserProfile, verifyUser, loginAdmin };
