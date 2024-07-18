import { Button } from "frames.js/next"
import { frames } from "../frames"
import { getProfileOwner } from "@/app/services/treasureHunt"
import {
  getTable,
  getTableId,
  getUserAllowance,
  getUserHand,
  prettifyHand,
} from "@/app/services/blackjack"
import { formatUnits } from "viem"

const handleRequest = frames(async (ctx) => {
  const tableId = getTableId(ctx)
  const owner = await getProfileOwner(ctx.message?.profileId)
  const [tableData, currentHand, allowance] = await Promise.all([
    getTable(tableId),
    getUserHand(tableId, owner),
    getUserAllowance(owner),
  ])

  const table = {
    remainingBalance: tableData[0].toString(),
    size: tableData[1].toString(),
    creator: tableData[2],
  }
  console.log(tableId, owner, currentHand)

  if (owner?.toLowerCase() === table.creator.toLowerCase()) {
    return {
      image: (
        <div tw="flex w-full h-full items-center justify-center">
          <div tw="flex flex-col items-center">
            <p>You cannot play against yourself</p>
          </div>
        </div>
      ),
      buttons: [
        <Button action="post" key="status-button" target="/start">
          Back
        </Button>,
      ],
      state: { ...ctx.state, table, currentHand, owner },
    }
  }

  if (allowance < table.size) {
    return {
      image: (
        <div tw="flex w-full h-full items-center justify-center">
          <div tw="flex flex-col items-center">
            <p>Approve the Blackjack contract to spend your tokens</p>
            <p>This is required to play - no tokens will be transferred unless you lose the hand</p>
          </div>
        </div>
      ),
      buttons: [
        <Button action="post" key="status-button" target="/table">
          Back
        </Button>,
        <Button action="tx" key="approve-button" target="/approve-tx" post_url="/approve-status">
          Approve $BONSAI
        </Button>,
      ],
      state: { ...ctx.state, table, currentHand, owner },
    }
  }

  const buttons = [
    <Button action="post" key="status-button" target="/table">
      Back
    </Button>,
    <Button action="tx" key="hit-button" target="/hit-tx" post_url="play-status">
      Hit
    </Button>,
  ]

  if (currentHand.length > 0) {
    buttons.push(
      <Button action="tx" key="stand-button" target="/stand-tx" post_url="play-status">
        Stand
      </Button>
    )
  }

  return {
    image: (
      <div tw="flex w-full h-full items-center justify-center">
        <div tw="flex flex-col items-center">
          <p>Table:</p>
          <p>Remaining balance: {formatUnits(table.remainingBalance, 18)}</p>
          <p>Bet size: {formatUnits(table.size, 18)}</p>
          <p>Your hand: {prettifyHand(currentHand)}</p>
        </div>
      </div>
    ),
    buttons,
    state: { ...ctx.state, table, currentHand, owner },
  }
})

export const GET = handleRequest
export const POST = handleRequest
