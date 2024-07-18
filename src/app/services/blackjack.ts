import BlackjackAbi from "./abi/Blackjack.json"
import { keccak256, encodePacked, encodeAbiParameters, parseAbiParameters, erc20Abi } from "viem"
import { publicClient } from "./moneyClubs"
import { BONSAI_TOKEN_ADDRESS } from "./utils"
import { privateKeyToAccount } from "viem/accounts"

export const BLACKJACK_ADDRESS = "0xc84A2e39a425f746c22607691FcEc0cF2a30cB50"

const { PRIVATE_KEY } = process.env
const adminAccount = privateKeyToAccount(`0x${PRIVATE_KEY}`) // from madfiprotocol.eth

export const getTableId = (ctx) => {
  const [profileId, pubId] = ctx.message?.pubId.split("-")
  return keccak256(encodePacked(["uint256", "uint256"], [BigInt(profileId), BigInt(pubId)]))
}

export const getTable = async (tableId): Promise<any> => {
  return await publicClient.readContract({
    address: BLACKJACK_ADDRESS,
    abi: BlackjackAbi,
    functionName: "tables",
    args: [tableId],
  })
}

export const getUserAllowance = async (account): Promise<BigInt> => {
  const allowance = publicClient.readContract({
    address: BONSAI_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: [account, BLACKJACK_ADDRESS],
  })

  return allowance as unknown as BigInt
}

export const getUserHand = async (tableId, account): Promise<any> => {
  return await publicClient.readContract({
    address: BLACKJACK_ADDRESS,
    abi: BlackjackAbi,
    functionName: "getHand",
    args: [tableId, account],
  })
}

export const getSignedRNG = async () => {
  // TODO: fetch two random numbers from chainlink or something
  const seedOne = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))
  const seedTwo = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))

  // create signed typed data hash
  const signature = await adminAccount.signTypedData({
    domain: {
      name: "VerifyRandom",
      version: "1",
      chainId: 137,
      verifyingContract: BLACKJACK_ADDRESS,
    },
    types: {
      RNGParams: [
        { name: "seedOne", type: "uint256" },
        { name: "seedTwo", type: "uint256" },
      ],
    },
    primaryType: "RNGParams",
    message: {
      seedOne,
      seedTwo,
    },
  })

  return {
    seedOne,
    seedTwo,
    signature,
  }
}

export const getModuleData = (action: "HIT" | "STAND", { seedOne, seedTwo, signature }) => {
  const actionEnum = action === "HIT" ? 0 : 1
  const amount = BigInt(0)
  return encodeAbiParameters(
    parseAbiParameters(
      "uint8 action, uint256 amount, uint256 seedOne, uint256 seedTwo, bytes memory signature"
    ),
    [actionEnum, amount, seedOne, seedTwo, signature]
  )
}

export const prettifyHand = (hand: { suit: number; rank: number }[]): string => {
  const suitEmojis = ["♥️", "♦️", "♣️", "♠️"]
  const rankNames = ["NONE", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

  return hand
    .map((card) => {
      const suitEmoji = suitEmojis[card.suit]
      const rankName = rankNames[card.rank]
      return `${rankName}${suitEmoji}`
    })
    .join(" ")
}
