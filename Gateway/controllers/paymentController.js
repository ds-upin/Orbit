const client = require('../grpc_clients/payment_client');

const createPaymentIntent = async (req, res) => {
    try {
        const { webtoken } = req.body;
        const { email, user_id } = req.user;
        client.InitiatePayment({ webtoken }, (err, response) => {
            if(err){
                return res.status(500).json({'msg':"Error occured in server"})
            }
            return res.status(response.status).json(response);
        });
    } catch (err) {
        return res.status(500).json({'msg':"Error occured in server"})
    }
}

module.exports = { createPaymentIntent };