import { frames } from "../frames"
import { transaction } from "frames.js/core"
import { encodeFunctionData, erc20Abi, maxUint256, parseUnits } from "viem"
import { BONSAI_TOKEN_ADDRESS } from "@/app/services/utils"
import { POKE_ADDRESS } from "@/app/services/poke"

export const POST = frames(async (ctx) => {
  const calldata = encodeFunctionData({
    abi: erc20Abi,
    functionName: "approve",
    args: [POKE_ADDRESS, maxUint256],
  })

  return transaction({
    chainId: "eip155:137",
    method: "eth_sendTransaction",
    params: {
      abi: erc20Abi,
      to: BONSAI_TOKEN_ADDRESS,
      data: calldata,
    },
  })
})
