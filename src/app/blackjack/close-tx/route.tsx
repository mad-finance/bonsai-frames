import LensHubAbi from "../../services/abi/LensHub.json"
import BlackjackAbi from "../../services/abi/Blackjack.json"
import { frames } from "../frames"
import { transaction } from "frames.js/core"
import { Abi, encodeFunctionData } from "viem"
import { BLACKJACK_ADDRESS, getModuleData, getTableId } from "@/app/services/blackjack"
import { LENS_HUB_ADDRESS } from "@/app/services/treasureHunt"

export const POST = frames(async (ctx) => {
  if (!ctx.message) throw new Error("No message")

  if (ctx?.message?.url?.includes("?table=")) {
    // call contract directly
    const calldata = encodeFunctionData({
      abi: BlackjackAbi,
      functionName: "closeGame",
      args: [getTableId(ctx), ctx.state.owner],
    })

    return transaction({
      chainId: "eip155:137",
      method: "eth_sendTransaction",
      params: {
        abi: BlackjackAbi as Abi,
        to: BLACKJACK_ADDRESS,
        data: calldata,
      },
    })
  } else {
    // act on lens post
    const pubParts = ctx.message?.pubId.split("-")

    // placeholder empty rng - it doesn't get checked
    const signedRNG = {
      seedOne: BigInt(0),
      seedTwo: BigInt(0),
      signature: `0x`,
    }
    const moduleData = getModuleData("CLOSE", signedRNG)
    const calldata = encodeFunctionData({
      abi: LensHubAbi,
      functionName: "act",
      args: [
        {
          publicationActedProfileId: pubParts[0],
          publicationActedId: pubParts[1],
          actorProfileId: ctx.message?.profileId,
          referrerProfileIds: [],
          referrerPubIds: [],
          actionModuleAddress: BLACKJACK_ADDRESS,
          actionModuleData: moduleData,
        },
      ],
    })

    return transaction({
      chainId: "eip155:137",
      method: "eth_sendTransaction",
      params: {
        abi: LensHubAbi as Abi,
        to: LENS_HUB_ADDRESS,
        data: calldata,
      },
    })
  }
})
