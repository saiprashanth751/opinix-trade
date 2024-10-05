"use server";
import prisma from "@repo/db/client"

export async function getTrades(userId: string) {
  try {
    const trades = await prisma.portfolio.findUnique({
      where: {
        userId: userId,
      },
      include: {
        trades: true,
      },
    });
    if (!trades) {
      return {success:true, trades};
    }else{
      return {success:false};
    }
  } catch (error) {
    return {success:false};
  }
}
