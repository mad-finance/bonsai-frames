import TreasureHuntAbi from "./abi/TreasureHunt.json"
import LensHubAbi from "./abi/LensHub.json"
import { lensClient } from "./lens"
import { publicClient } from "./moneyClubs"
import { keccak256, encodeAbiParameters, parseAbiParameters } from "viem"
import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client"

export const TREASURE_HUNT_ADDRESS = "0xDDEFa1ea12Fa171586028a0a6e328c0cB57B46B2"
export const LENS_HUB_ADDRESS = "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d"

// const madfiSubgraphUrl = `https://gateway-arbitrum.network.thegraph.com/api/${process.env.MONEY_CLUBS_SUBGRAPH_API_KEY}/subgraphs/id/BT7yTf18FbLQpbZ35k9sTnQ8PVNEjG3QgbsggCMnC6oU`
const madfiSubgraphUrl = "https://api.studio.thegraph.com/query/18207/madfi-subgraph/version/latest"

const TREASURE_HUNT = gql`
  query Hunt($id: Bytes!) {
    treasureHunt(id: $id) {
      treasure {
        id
      }
    }
  }
`

export const convertIntToHexLensId = (profileId: string) => {
  let hexProfileId = parseInt(profileId).toString(16)
  // If the hex parsed profile id is an odd number length then it needs to be padded with a zero after the 0x
  if (hexProfileId.length % 2 !== 0) {
    hexProfileId = "0x0" + hexProfileId
  } else {
    hexProfileId = "0x" + hexProfileId
  }
  return hexProfileId
}

const subgraphClient = () => {
  return new ApolloClient({
    ssrMode: typeof window === "undefined", // set to true for server-side rendering
    link: new HttpLink({ uri: madfiSubgraphUrl }),
    cache: new InMemoryCache(),
  })
}

export const isTreasureFound = async (address, huntId) => {
  const huntIdFormatted = convertIntToHexLensId(huntId.toString())
  console.log(huntIdFormatted)
  const { data } = await subgraphClient().query({
    query: TREASURE_HUNT,
    variables: { id: huntIdFormatted },
  })

  console.log(data)

  const treasureClue = data.treasureHunt.treasure
  if (treasureClue !== null) {
    return await publicClient.readContract({
      address: TREASURE_HUNT_ADDRESS,
      abi: TreasureHuntAbi,
      functionName: "foundClue",
      args: [huntId, address, treasureClue],
    })
  } else return false
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
