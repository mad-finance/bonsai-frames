/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next"
import { baseUrl, frames } from "../frames"
import { publicClient } from "@/app/services/moneyClubs"
import { polygonScanUrl } from "@/app/services/utils"

export const POST = frames(async (ctx) => {
  const currentState = ctx.state
  const transactionId = ctx.message?.actionResponse || currentState.transactionId

  const buttons: any[] = []
  let txPending = false

  if (transactionId) {
    const transaction = await publicClient.getTransactionReceipt({
      hash: transactionId! as `0x${string}`,
    })

    txPending = !transaction?.blockHash
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
          Refresh Status
        </Button>
      )
    }
  }

  buttons.push(
    <Button action="post" target="/table">
      Return to Table
    </Button>
  )

  return {
    image: (
      <div
        tw="flex w-full h-full relative items-center justify-center"
        style={{
          backgroundImage:
            `url(${baseUrl}/blackjack/` +
            (txPending
              ? "blackjack-table-pending.gif"
              : "blackjack-table-transaction-complete.jpg") +
            `)`,
          backgroundSize: "cover",
          fontFamily: "'Verdana', monospace",
          fontWeight: 700,
          color: "#FFFFFF",
        }}
      >
        {/* 
        <div tw="flex flex-col items-center">
          <p>&nbsp;</p>
          <p tw="m-10">{txPending ? "Transaction Pending..." : "Transaction Complete!"}</p>
        </div>
      */}
      </div>
    ),
    buttons,
    state: { ...currentState, transactionId },
  }
})
