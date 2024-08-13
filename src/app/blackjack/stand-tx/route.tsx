import LensHubAbi from "../../services/abi/LensHub.json"
import BlackjackAbi from "../../services/abi/Blackjack.json"
import { frames } from "../frames"
import { transaction } from "frames.js/core"
import { Abi, encodeFunctionData } from "viem"
import {
  BLACKJACK_ADDRESS,
  getModuleData,
  getSignedRNG,
} from "@/app/services/blackjack"
import { LENS_HUB_ADDRESS } from "@/app/services/treasureHunt"

export const POST = frames(async (ctx) => {
  if (!ctx.message) throw new Error("No message")
  if (!ctx.state) throw new Error("No state")

  const pubParts = ctx.message?.pubId.split("-")
  const signedRNG = await getSignedRNG()

  if (ctx.state.table?.shared) {
    // call contract directly
    const calldata = encodeFunctionData({
      abi: BlackjackAbi,
      functionName: "play",
      args: [
        1,
        ctx.state.table.tableId,
        signedRNG.signature,
        { seedOne: signedRNG.seedOne, seedTwo: signedRNG.seedTwo },
      ],
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
    const moduleData = getModuleData("STAND", signedRNG)

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
