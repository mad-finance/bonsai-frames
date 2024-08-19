import LensHubAbi from "../../services/abi/LensHub.json"
import PokeAbi from "../../services/abi/Poke.json"
import { frames } from "../frames"
import { transaction } from "frames.js/core"
import { Abi, encodeAbiParameters, encodeFunctionData, parseAbiParameters } from "viem"
import { LENS_HUB_ADDRESS } from "@/app/services/treasureHunt"
import { DEFAULT_POKE_AMOUNT, POKE_ADDRESS } from "@/app/services/poke"

export const POST = frames(async (ctx) => {
  if (!ctx.message) throw new Error("No message")
  if (!ctx.state) throw new Error("No state")
  if (!ctx.state.pokeParams) throw new Error("No poke params")

  // // act on lens post
  // const pubParts = ctx.message.pubId.split("-")
  // const moduleData = encodeAbiParameters(
  //   parseAbiParameters("uint256 toProfileId, uint256 amount"),
  //   [BigInt(ctx.state.pokeParams.toProfileId), DEFAULT_POKE_AMOUNT]
  // )

  // const calldata = encodeFunctionData({
  //   abi: LensHubAbi,
  //   functionName: "act",
  //   args: [
  //     {
  //       publicationActedProfileId: pubParts[0],
  //       publicationActedId: pubParts[1],
  //       actorProfileId: ctx.message.profileId,
  //       referrerProfileIds: [],
  //       referrerPubIds: [],
  //       actionModuleAddress: POKE_ADDRESS,
  //       actionModuleData: moduleData,
  //     },
  //   ],
  // })

  // call poke on contract
  const calldata = encodeFunctionData({
    abi: PokeAbi,
    functionName: "poke",
    args: [ctx.message.profileId, BigInt(ctx.state.pokeParams.toProfileId), DEFAULT_POKE_AMOUNT],
  })

  return transaction({
    chainId: "eip155:137",
    method: "eth_sendTransaction",
    params: {
      abi: PokeAbi as Abi,
      to: POKE_ADDRESS,
      data: calldata,
    },
  })
})
