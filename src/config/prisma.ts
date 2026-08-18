import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const connectPrisma = async () => {
  await prisma.$connect();
  console.log("Prisma database connected");
};

export default prisma;
