/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next"
import { getAddressForFid } from "frames.js"
import { frames } from "../frames"
import { lensClient } from "@/app/services/lens"
import { formatEther } from "viem"
import { roundedToFixed } from "@/app/services/utils"
import { getRemainingBal, getSize, getUserAllowance, getUserHand } from "@/app/services/blackjack"

const handleRequest = frames(async (ctx) => {
  const { dealerProfileId } = ctx.state
  const currentState = ctx.state

  if (ctx.message?.transactionId) {
    console.log(`ctx.message?.transactionId: ${ctx.message?.transactionId}`)
  }

  let walletAddress: string | undefined = ctx.message?.connectedAddress
  if (!walletAddress && ctx.message?.profileId) {
    // lens payload
    const owner = await lensClient.profile.fetch({ forProfileId: ctx.message?.profileId })
    walletAddress = owner?.ownedBy.address
  } else if (!walletAddress && ctx.message?.requesterFid) {
    walletAddress = await getAddressForFid({
      fid: ctx.message?.requesterFid,
      options: { fallbackToCustodyAddress: true },
    })
  }

  // TODO: get current remaining balance, size and user's hand
  const [remainingBalance, betSize, allowance, userHand] = await Promise.all([
    getRemainingBal(),
    getSize(),
    getUserAllowance(),
    getUserHand(),
  ])

  const buttons: any[] = []

  if (allowance < betSize) {
    buttons.push(
      <Button action="tx" target="/club-approve-tx" post_url="/club-approve-status">
        Approve $BONSAI
      </Button>
    )
  } else {
    buttons.push(
      <Button action="tx" target="/club-hit-tx" post_url="/club-hit-status">
        Hit
      </Button>
    )

    if (userHand.length > 0) {
      buttons.push(
        <Button action="tx" target="/club-stand-tx" post_url="/club-stand-status">
          Stand
        </Button>
      )
    }
  }

  const updatedState = {
    ...currentState,
    betSize,
    walletAddress,
    remainingBalance: remainingBalance.toString(),
  }

  return {
    image: (
      <div tw="flex flex-col items-center justify-center">
        <div tw="flex flex-col items-center">
          <span tw="flex h-48 w-48 overflow-hidden rounded-full border-8 border-gray-800">
            <img src={moneyClub.image} tw="h-full w-full" />
          </span>
          <div tw="flex justify-center items-center bg-gray-800 text-white font-bold rounded-xl py-3 px-4 mt-10">
            ${moneyClub.handle}
          </div>
        </div>
        <div tw="flex justify-center items-center bg-gray-800 text-white font-bold rounded-xl py-3 px-4 mt-10 text-5xl">
          Current Price: {`${roundedToFixed(parseFloat(formatEther(currentPrice as bigint)), 0)}`}
          <span tw="ml-2 text-green-400">$BONSAI</span>
        </div>
      </div>
    ),
    buttons,
    state: updatedState,
  }
})

export const GET = handleRequest
export const POST = handleRequest
