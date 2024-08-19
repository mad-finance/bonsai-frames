import PokeAbi from "./abi/Poke.json"
import { erc20Abi, parseUnits } from "viem"
import { publicClient } from "./moneyClubs"
import { BONSAI_TOKEN_ADDRESS } from "./utils"
import { lensClient } from "./lens"

export const POKE_ADDRESS = "0x54d42da1eb263B4dA94EDE6077FA23311B76bD03"

export const DEFAULT_POKE_AMOUNT = parseUnits("100", 18)

export const composeUrl = (text, embedUrl, platform) => {
  if (platform === "lens") {
    return `lens://compose?text=${encodeURIComponent(text + "\n\n" + embedUrl)}`
  } else if (platform === "farcaster") {
    return `https://warpcast.com/~/compose?text=${encodeURIComponent(
      text
    )}&embeds[]=${encodeURIComponent(embedUrl)}`
  } else {
    return ``
  }
}

export const getUserAllowancePoke = async (account): Promise<bigint> => {
  const allowance = publicClient.readContract({
    address: BONSAI_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: [account, POKE_ADDRESS],
  })

  return allowance
}

export const getPokeStatus = async (userProfileId, forHandle) => {
  // get profile id of handleToPoke
  const profile = await lensClient.profile.fetch({ forHandle: `lens/${forHandle}` })
  const toProfileId = profile?.id ? Number(profile.id) : 0

  // get who started poke
  const whoStartedIt = await publicClient.readContract({
    address: POKE_ADDRESS,
    abi: PokeAbi,
    functionName: "pokeExists",
    args: [userProfileId, toProfileId],
  })

  // get poke status
  const pokeStatus = await publicClient.readContract({
    address: POKE_ADDRESS,
    abi: PokeAbi,
    functionName: "pokes",
    args: [whoStartedIt, whoStartedIt == userProfileId ? toProfileId : userProfileId],
  })

  return {
    toProfileId,
    whoStartedIt: (whoStartedIt as bigint).toString(),
    pokeStatus: {
      amount: pokeStatus[0].toString(),
      deposited: pokeStatus[1],
      lastPokeTimestamp: Number(pokeStatus[2]),
      lastPokeProfileId: Number(pokeStatus[3]),
    },
  }
}

export const formatTimeRemaining = (milliseconds: number): string => {
  if (milliseconds <= 0) return "00:00"
  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}
