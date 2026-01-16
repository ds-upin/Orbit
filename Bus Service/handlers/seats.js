const prisma = require('../prismaClient');
// Done
const addSeat = async (call, callback) => {
    const { seat_number, model_id } = call.request;
    if(!model_id || !seat_number || typeof(model_id)!=="number" || typeof(seat_number)!=='string'){
        callback(null,{
            status:400,
            msg:'Seat Number or Model is incorrect.',
            seat_id:0
        });
        return;
    }
    try{
        const result = await prisma.$queryRaw`INSERT INTO seats (seat_number, model_id) VALUES (${seat_number}, ${model_id}) RETURNING id`;
        if(result[0].id){
            callback(null,{
                status:201,
                msg:"",
                seat_id: result[0].id
            });
            return;
        }
        else {
            callback(null,{
                status:400,
                msg:"Either model or seat number exist",
                seat_id: 0
            }); 
        }
    } catch (err) {
        callback(null,{
            status:500,
            msg:"Internal Server Error",
            seat_id:0
        });
    }
};

const deleteSeat = async (call, callback) => {
    const { model_id, seat_number } = call.request;
    callback(null, {
        status:200,
        msg: ""
    });
    return;
};

module.exports =  { addSeat, deleteSeat};

