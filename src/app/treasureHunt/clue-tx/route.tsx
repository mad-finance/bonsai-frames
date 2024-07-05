import LensHubAbi from "../../services/abi/LensHub.json"
import { frames } from "../frames"
import { transaction } from "frames.js/core"
import { Abi, encodeFunctionData } from "viem"
import { LENS_HUB_ADDRESS, TREASURE_HUNT_ADDRESS } from "@/app/services/treasureHunt"

export const POST = frames(async (ctx) => {
  if (!ctx.message) throw new Error("No message")
  if (!ctx.state) throw new Error("No state")

  console.log("message", ctx.message)
  console.log("state", ctx.state)

  const pubParts = ctx.message?.pubId.split("-")

  console.log("args", {
    publicationActedProfileId: pubParts[0],
    publicationActedId: pubParts[1],
    actorProfileId: ctx.message?.profileId,
    referrerProfileIds: [],
    referrerPubIds: [],
    actionModuleAddress: TREASURE_HUNT_ADDRESS,
    actionModuleData: ctx.state?.secret,
  })

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
        actionModuleAddress: TREASURE_HUNT_ADDRESS,
        actionModuleData: ctx.state?.secret,
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
