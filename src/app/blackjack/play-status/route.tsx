/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next"
import { frames } from "../frames"
import { publicClient } from "@/app/services/moneyClubs"
import { polygonScanUrl } from "@/app/services/utils"
import BlackjackAbi from "../../services/abi/Blackjack.json"
import { decodeEventLog } from "viem"

export const POST = frames(async (ctx) => {
  const currentState = ctx.state
  const transactionId = ctx.message?.transactionId || currentState.transactionId

  const [transaction] = await Promise.all([
    (async () => {
      if (!!transactionId) {
        return await publicClient.getTransactionReceipt({ hash: transactionId! as `0x${string}` })
      }
    })(),
  ])

  const buttons: any[] = []
  const txPending = !transaction?.blockHash
  if (transactionId && txPending) {
    buttons.push(
      <Button action="link" target={polygonScanUrl(transactionId! as `0x${string}`)}>
        View on block explorer
      </Button>
    )
  }

  if (txPending) {
    buttons.push(
      <Button action="post" target="/play-status">
        Refresh
      </Button>
    )
  } else {
    buttons.push(
      <Button action="post" target="/table">
        Return to Table
      </Button>
    )
  }

  // decode game result from events
  let gameResult: string | null = null

  if (transaction && !txPending) {
    const logs = transaction.logs
      .map((log) => {
        try {
          return decodeEventLog({
            abi: BlackjackAbi,
            data: log.data,
            topics: log.topics,
          })
        } catch {
          return null
        }
      })
      .filter(Boolean)

    const playerWinsEvent = logs.find((log) => log?.eventName === "PlayerWins")
    const dealerWinsEvent = logs.find((log) => log?.eventName === "DealerWins")

    if (playerWinsEvent) {
      gameResult = "Player Wins!"
    } else if (dealerWinsEvent) {
      gameResult = "Dealer Wins!"
    }
  }

  return {
    image: (
      <div tw="flex w-full h-full items-center justify-center">
        <div tw="flex flex-col items-center">
          {gameResult ? <p>{gameResult}</p> : <p>Return to table to view your hand</p>}
          {txPending && <p>Tx Pending</p>}
        </div>
      </div>
    ),
    buttons,
    state: { ...currentState, transactionId },
  }
})
