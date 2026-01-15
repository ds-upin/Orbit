require('dotenv').config();

const prisma = require('./prismaClient');

function main() {
    const res = prisma.buses.findMany();
    console.log(res[0]);
}
main()