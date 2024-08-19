import { Button } from "frames.js/next"
import { frames } from "../frames"
import { getProfileOwner } from "@/app/services/treasureHunt"
import {
  DEFAULT_POKE_AMOUNT,
  formatTimeRemaining,
  getPokeStatus,
  getUserAllowancePoke,
} from "@/app/services/poke"
import { formatUnits } from "viem"

const handleRequest = frames(async (ctx) => {
  // fetch data
  const toHandle =
    ctx.message?.inputText && ctx.message?.inputText?.length > 0
      ? ctx.message?.inputText
      : ctx.state.pokeParams?.toHandle

  const owner = await getProfileOwner(ctx.message?.profileId)
  const [pokeParams, allowance] = await Promise.all([
    getPokeStatus(ctx.message?.profileId, toHandle),
    getUserAllowancePoke(owner),
  ])

  const updatedState = {
    ...ctx.state,
    pokeParams: {
      toHandle,
      ...pokeParams,
    },
  }

  // handle allowance
  if (allowance < DEFAULT_POKE_AMOUNT) {
    return {
      image: (
        <div tw="flex">
          <p>Approve the Poke contract to place your wager</p>
        </div>
      ),
      buttons: [
        <Button action="post" key="button1" target="/start">
          Back
        </Button>,
        <Button action="tx" key="button2" target="/approve-tx" post_url="/send-poke">
          Approve $BONSAI
        </Button>,
      ],
      state: updatedState,
    }
  }

  // time remaining
  const lastPokeTimestamp = Number(pokeParams.pokeStatus.lastPokeTimestamp) * 1000 // Convert to milliseconds
  const pokeDeadline = lastPokeTimestamp + 36 * 60 * 60 * 1000 // Add 36 hours in milliseconds
  const timeRemaining = lastPokeTimestamp > 0 ? pokeDeadline - Date.now() : null

  // only show poke button if its your turn to poke
  let buttons = [
    <Button action="post" key="button1" target="/start">
      Back
    </Button>,
    <Button action="post" key="button2" target="/send-poke">
      Refresh
    </Button>,
  ]
  if (
    pokeParams.pokeStatus.lastPokeProfileId != Number(ctx.message?.profileId)
  ) {
    buttons.push(
      <Button action="tx" key="button3" target="/poke-tx" post_url="/poke-sent">
        {timeRemaining && timeRemaining > 0 || pokeParams.pokeStatus.lastPokeProfileId === 0 ? "Poke" : "End"}
      </Button>
    )
  }

  // nothing found
  if (pokeParams.whoStartedIt == "0") {
    return {
      image: (
        <div tw="flex flex-col items-center">
          <p>You don&apos;t have any active poke war with this person!</p>
        </div>
      ),
      buttons,
      state: updatedState,
    }
  }

  return {
    image: (
      <div tw="flex flex-col items-center">
        <p>Poke war started by: {pokeParams.whoStartedIt.toString()}</p>
        <p>Wager amount: {formatUnits(BigInt(pokeParams.pokeStatus.amount), 18)}</p>
        <p>Last poke was by: {pokeParams.pokeStatus.lastPokeProfileId.toString()}</p>
        {timeRemaining &&
          (timeRemaining > 0 ? (
            <p>Time remaining for poke back: {formatTimeRemaining(timeRemaining)}</p>
          ) : (
            <p>Game Over</p>
          ))}
      </div>
    ),
    buttons,
    state: updatedState,
  }
})

export const GET = handleRequest
export const POST = handleRequest
