import { frames } from "../frames"
import { transaction } from "frames.js/core"
import { encodeFunctionData, erc20Abi } from "viem"
import { BONSAI_TOKEN_ADDRESS } from "@/app/services/utils"
import { BLACKJACK_ADDRESS } from "@/app/services/blackjack"

export const POST = frames(async (ctx) => {
  if (!ctx.state.table?.size) throw new Error("No size")

  const amount = BigInt(ctx.state.table.size)

  const calldata = encodeFunctionData({
    abi: erc20Abi,
    functionName: "approve",
    args: [BLACKJACK_ADDRESS, amount],
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
