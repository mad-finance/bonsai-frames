/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next"
import { frames } from "../frames"
import { publicClient } from "@/app/services/moneyClubs"
import { polygonScanUrl } from "@/app/services/utils"

export const POST = frames(async (ctx) => {
  const currentState = ctx.state
  const transactionId = ctx.message?.transactionId || currentState.transactionId

  const [transaction] = await Promise.all([
    (async () => {
      if (!!transactionId) {
        return await publicClient.getTransaction({ hash: transactionId! as `0x${string}` })
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
      <Button action="post" target="/approve-status">
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

  const updatedState = { ...currentState, transactionId }

  return {
    image: (
      <div tw="flex w-full h-full items-center justify-center">
        <div tw="flex flex-col items-center">
          <p>Tx pending</p>
        </div>
      </div>
    ),
    buttons,
    state: updatedState,
  }
})
