const { PrismaClient } = require("@prisma/client");

let prisma = null;

const getPrismaClient = () => {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
};

module.exports = { getPrismaClient };
