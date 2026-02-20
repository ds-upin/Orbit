import client from '../grpc_clients/payment_client.js';

const createPaymentIntent = async (req, res) => {
    try {
        const { webtoken } = req.body;
        const { email, id, role, name } = req.user;
        client.InitiatePayment({ webtoken, name, email, user_id: id }, (err, response) => {
            if (err) {
                return res.status(500).json({ 'msg': "Error occured in server" })
            }
            return res.status(response.status).json(response);
        });
    } catch (err) {
        console.log("error",err)
        return res.status(500).json({ 'msg': "Error occured in server" })
    }
}

export { createPaymentIntent };