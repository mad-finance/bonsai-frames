import { frames } from "../frames";
import { transaction } from "frames.js/core";
import { encodeFunctionData, erc20Abi, maxUint256, parseEther } from "viem";
import { MONEY_CLUBS_CONTRACT_ADDRESS } from "@/app/services/moneyClubs";
import { BONSAI_TOKEN_ADDRESS } from "@/app/services/utils";

export const POST = frames(async (ctx) => {
  if (!ctx.message) throw new Error("No message");

  const currentPriceBigInt = BigInt(ctx.state.currentPrice!);
  const quoteAmount = currentPriceBigInt + (currentPriceBigInt * BigInt(5) / BigInt(100));

  const calldata = encodeFunctionData({
    abi: erc20Abi,
    functionName: "approve",
    args: [MONEY_CLUBS_CONTRACT_ADDRESS, quoteAmount]
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