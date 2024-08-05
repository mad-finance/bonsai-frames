import BlackjackAbi from "./abi/Blackjack.json"
import { keccak256, encodePacked, encodeAbiParameters, parseAbiParameters, erc20Abi } from "viem"
import { publicClient } from "./moneyClubs"
import { BONSAI_TOKEN_ADDRESS } from "./utils"
import { privateKeyToAccount } from "viem/accounts"
import axios from "axios"

export const BLACKJACK_ADDRESS = "0xD2339EB553c5855D4bDFD9C110430EB722B86FfF"

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

export const getGameInfo = async (tableId, account): Promise<any> => {
  return await publicClient.readContract({
    address: BLACKJACK_ADDRESS,
    abi: BlackjackAbi,
    functionName: "getGameInfo",
    args: [tableId, account],
  })
}

export const getSignedRNG = async () => {
  // Fetch random numbers from ANU Quantum Random Numbers API
  let seedOne, seedTwo
  try {
    const { data } = await axios.post("https://api.random.org/json-rpc/4/invoke", {
      jsonrpc: "2.0",
      method: "generateIntegers",
      params: {
        apiKey: process.env.RANDOM_API_KEY,
        n: 2,
        min: 0,
        max: 65536,
        replacement: true,
      },
      id: 1,
    })

    if (data.result) {
      const randomNumbers = data.result.random.data
      seedOne = BigInt(randomNumbers[0])
      seedTwo = BigInt(randomNumbers[1])
    } else {
      console.error(`Error: ${data.error.message}`)
    }
  } catch (error) {
    console.error("Error fetching from ANU API:", error)
  }

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

export const getModuleData = (
  action: "HIT" | "STAND" | "CLOSE",
  { seedOne, seedTwo, signature }
) => {
  const actionEnum = action === "HIT" ? 0 : action === "STAND" ? 1 : 2
  const amount = BigInt(0)
  return encodeAbiParameters(
    parseAbiParameters(
      "uint8 action, uint256 amount, uint256 seedOne, uint256 seedTwo, bytes memory signature"
    ),
    [actionEnum, amount, seedOne, seedTwo, signature]
  )
}

interface Hand {
  suit: number
  rank: number
}

interface Game {
  startedAt?: number
  isOver?: boolean
  playerHand: Hand[]
  dealerHand: Hand[]
}

export const didPlayerWin = (game: Game): boolean => {
  const calculateHandValue = (hand: Hand[]): number => {
    let value = 0
    let aces = 0

    for (const card of hand) {
      if (card.rank === 1) {
        aces++
        value += 11
      } else if (card.rank > 10) {
        value += 10
      } else {
        value += card.rank
      }
    }

    while (value > 21 && aces > 0) {
      value -= 10
      aces--
    }

    return value
  }

  const playerValue = calculateHandValue(game.playerHand)
  const dealerValue = calculateHandValue(game.dealerHand)

  if (playerValue > 21) return false // Player busts
  if (dealerValue > 21) return true // Dealer busts
  return playerValue >= dealerValue // Compare values
}

/* Backup
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
} */
