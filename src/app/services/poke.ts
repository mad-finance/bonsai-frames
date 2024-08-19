import PokeAbi from "./abi/Poke.json"
import { erc20Abi, parseUnits } from "viem"
import { publicClient } from "./moneyClubs"
import { BONSAI_TOKEN_ADDRESS } from "./utils"
import { lensClient } from "./lens"
import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client"
import { convertIntToHexLensId } from "./treasureHunt"

export const POKE_ADDRESS = "0x3e3568b5f98e109Eec0DBb8B18eD8ED4A56A62b9"

export const DEFAULT_POKE_AMOUNT = parseUnits("100", 18)
export const DEFAULT_POKE_INCREMENT = parseUnits("1", 18)

const madfiSubgraphUrl = "https://api.studio.thegraph.com/query/18207/madfi-subgraph/version/latest"
const subgraphClient = () => {
  return new ApolloClient({
    ssrMode: typeof window === "undefined", // set to true for server-side rendering
    link: new HttpLink({ uri: madfiSubgraphUrl }),
    cache: new InMemoryCache(),
  })
}

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

const POKE_WAR = gql`
  query PokeWar($id: Bytes!) {
    pokeWar(id: $id) {
      nonce
      startedAt
      endedAt
      startingAmount
      currentAmount
      increment
      deposited
      lastPokeTimestamp
      lastPokeProfileId
      startedByProfileId
      toProfileId
      streak
    }
  }
`

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

  // fetch subgraph data for start time and streak
  const { data } = await subgraphClient().query({
    query: POKE_WAR,
    variables: { id: convertIntToHexLensId(pokeStatus[5].toString()) },
  })

  return {
    toProfileId,
    whoStartedIt: (whoStartedIt as bigint).toString(),
    pokeStatus: {
      amount: pokeStatus[0].toString(),
      increment: pokeStatus[1].toString(),
      deposited: pokeStatus[2],
      lastPokeTimestamp: Number(pokeStatus[3]),
      lastPokeProfileId: Number(pokeStatus[4]),
      nonce: pokeStatus[5].toString(),
      subgraphData: data.pokeWar,
    },
  }
}

export const formatTimeRemaining = (milliseconds: number): string => {
  if (milliseconds <= 0) return "00:00"
  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}
