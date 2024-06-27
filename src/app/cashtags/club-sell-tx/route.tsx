import { frames } from "../frames";
import { transaction } from "frames.js/core";
import { Abi, encodeFunctionData, zeroAddress } from "viem";
import { MONEY_CLUBS_CONTRACT_ADDRESS } from "@/app/services/moneyClubs";
import MadMoneyClubsAbi from "@/app/services/abi/MadMoneyClubs.json";

export const POST = frames(async (ctx) => {
  if (!ctx.message) throw new Error("No message");

  const { sellAmount, moneyClubAddress } = ctx.state;

  const calldata = encodeFunctionData({
    abi: MadMoneyClubsAbi,
    functionName: "sellChips",
    args: [moneyClubAddress, sellAmount, zeroAddress]
  });

  return transaction({
    chainId: "eip155:137",
    method: "eth_sendTransaction",
    params: {
      abi: MadMoneyClubsAbi as Abi,
      to: MONEY_CLUBS_CONTRACT_ADDRESS,
      data: calldata
    },
  });
});