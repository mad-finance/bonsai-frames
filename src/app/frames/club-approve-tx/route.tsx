import { frames } from "../frames";
import { transaction } from "frames.js/core";
import { encodeFunctionData, erc20Abi, maxUint256, parseEther } from "viem";
import { MONEY_CLUBS_CONTRACT_ADDRESS } from "@/app/services/moneyClubs";
import { BONSAI_TOKEN_ADDRESS } from "@/app/services/utils";

export const POST = frames(async (ctx) => {
  if (!ctx.message) {
    throw new Error("No message");
  }

  if (ctx.message?.transactionId) {
    console.log("got the tx id");
  }

  const calldata = encodeFunctionData({
    abi: erc20Abi,
    functionName: "approve",
    args: [MONEY_CLUBS_CONTRACT_ADDRESS, parseEther('10000')] // maxUint256]
  });

  return transaction({
    chainId: "eip155:137",
    method: "eth_sendTransaction",
    params: {
      abi: erc20Abi,
      to: BONSAI_TOKEN_ADDRESS,
      data: calldata
    },
  });
});