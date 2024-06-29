import TreasureHuntAbi from "./abi/TreasureHunt.json"
import LensHubAbi from "./abi/LensHub.json"
import { lensClient } from "./lens"
import { publicClient } from "./moneyClubs"
import { keccak256, encodeAbiParameters, parseAbiParameters } from "viem"

export const TREASURE_HUNT_ADDRESS = "0xDDEFa1ea12Fa171586028a0a6e328c0cB57B46B2"
export const LENS_HUB_ADDRESS = "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d"

export const isPostFound = async (address, profileId, pubId) => {
  return await publicClient.readContract({
    address: TREASURE_HUNT_ADDRESS,
    abi: TreasureHuntAbi,
    functionName: "foundPost",
    args: [address, profileId, pubId],
  })
}

export const getProfileOwner = async (forProfileId) => {
  const profile = await lensClient.profile.fetch({ forProfileId })
  return profile?.ownedBy.address
}

export const ctxToFound = async (ctx, owner) => {
  const pubParts = ctx.message?.pubId.split("-")
  return await isPostFound(owner, pubParts[0], pubParts[1])
}

export const simulateAct = async (args: any, account) => {
  try {
    await publicClient.simulateContract({
      address: LENS_HUB_ADDRESS,
      abi: LensHubAbi,
      functionName: "act",
      args: [args],
      account,
    })
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

export const hashedSecret = (input) => {
  // Hash the secret
  return keccak256(encodeAbiParameters(parseAbiParameters("string"), [input]))
}
