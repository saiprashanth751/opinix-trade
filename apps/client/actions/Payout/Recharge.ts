"use server";
import prisma from "@repo/db/client"

export const DepositeMoneyInWallet = async (userId: string, amount: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return { success: false, message: "User not found." };
    }
    const newBalance = Math.max(0, (user.balance += amount));
    await prisma.user.update({
      where: { id: userId },
      data: { balance: newBalance },
    });
    return { success: true, message: "Deposit successful." };
  } catch (e) {
    console.error("Error depositing money:", e);
    return { success: false, message: "Error while depositing money." };
  }
};
