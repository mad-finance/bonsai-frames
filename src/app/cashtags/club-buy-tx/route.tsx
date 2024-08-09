import { frames } from "../frames";
import { transaction } from "frames.js/core";
import { Abi, encodeFunctionData, zeroAddress } from "viem";
import { MONEY_CLUBS_CONTRACT_ADDRESS } from "@/app/services/moneyClubs";
import MoneyClubsAbi from "@/app/services/abi/MoneyClubs.json";

export const POST = frames(async (ctx) => {
  if (!ctx.message) throw new Error("No message");

  const { buyAmount, moneyClubAddress, walletAddress } = ctx.state;

  const calldata = encodeFunctionData({
    abi: MoneyClubsAbi,
    functionName: "buyChips",
    args: [moneyClubAddress, buyAmount, zeroAddress, walletAddress]
  });

  return transaction({
    chainId: "eip155:137",
    method: "eth_sendTransaction",
    params: {
      abi: MoneyClubsAbi as Abi,
      to: MONEY_CLUBS_CONTRACT_ADDRESS,
      data: calldata
    },
  });
});