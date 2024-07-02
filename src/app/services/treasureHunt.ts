import TreasureHuntAbi from "./abi/TreasureHunt.json"
import LensHubAbi from "./abi/LensHub.json"
import { lensClient } from "./lens"
import { publicClient } from "./moneyClubs"
import { keccak256, encodeAbiParameters, parseAbiParameters } from "viem"
import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client"

export const TREASURE_HUNT_ADDRESS = "0xDDEFa1ea12Fa171586028a0a6e328c0cB57B46B2"
export const LENS_HUB_ADDRESS = "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d"

const madfiSubgraphUrl = `https://gateway-arbitrum.network.thegraph.com/api/${process.env.NEXT_PUBLIC_MONEY_CLUBS_SUBGRAPH_API_KEY}/subgraphs/id/BT7yTf18FbLQpbZ35k9sTnQ8PVNEjG3QgbsggCMnC6oU`

const TREASURE_HUNT = gql`
  query Hunt($id: Bytes!) {
    treasureHunt(id: $id) {
      treasure {
        id
      }
    }
  }
`

const subgraphClient = () => {
  return new ApolloClient({
    ssrMode: typeof window === "undefined", // set to true for server-side rendering
    link: new HttpLink({ uri: madfiSubgraphUrl }),
    cache: new InMemoryCache(),
  })
}

export const isTreasureFound = async (address, huntId) => {
  const { data } = await subgraphClient().query({
    query: TREASURE_HUNT,
    variables: { id: huntId },
  })

  const treasureClue = data.treasureHunt.treasure
  return await publicClient.readContract({
    address: TREASURE_HUNT_ADDRESS,
    abi: TreasureHuntAbi,
    functionName: "foundClue",
    args: [huntId, address, treasureClue],
  })
}

export const postToHunt = async (profileId, pubId) => {
  return await publicClient.readContract({
    address: TREASURE_HUNT_ADDRESS,
    abi: TreasureHuntAbi,
    functionName: "postToHunt",
    args: [profileId, pubId],
  })
}

export const ctxToTreasureFound = async (ctx, owner) => {
  const [profileId, pubId] = ctx.message?.pubId.split("-")
  const huntId = await postToHunt(profileId, pubId)
  return await isTreasureFound(owner, huntId)
}

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
  const [profileId, pubId] = ctx.message?.pubId.split("-")
  return await isPostFound(owner, profileId, pubId)
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
