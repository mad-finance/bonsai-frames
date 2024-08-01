import LensHubAbi from "../../services/abi/LensHub.json"
import { frames } from "../frames"
import { transaction } from "frames.js/core"
import { Abi, encodeFunctionData } from "viem"
import { BLACKJACK_ADDRESS, getModuleData, getSignedRNG } from "@/app/services/blackjack"
import { LENS_HUB_ADDRESS } from "@/app/services/treasureHunt"

export const POST = frames(async (ctx) => {
  if (!ctx.message) throw new Error("No message")

    console.log("TX", ctx.message)

  const pubParts = ctx.message?.pubId.split("-")
  const signedRNG = await getSignedRNG()
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
})
