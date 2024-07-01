import { Button } from "frames.js/next"
import { clueFoundImg, clueNotFoundImg, frames } from "../frames"
import { ctxToFound } from "@/app/services/treasureHunt"

const handleRequest = frames(async (ctx) => {
  const transactionId = ctx.message?.transactionId || ctx.state?.transactionId
  const found = await ctxToFound(ctx, ctx.state.owner)

  let buttons = [
    <Button action="post" key="button1" target="/clue">
      ⬅️ Back
    </Button>,
  ]
  if (!found) {
    buttons.push(
      <Button action="post" key="button2" target="/clue-found">
        🔄 Refresh
      </Button>
    )
  }

  return {
    image: found ? clueFoundImg : clueNotFoundImg,
    buttons,
    state: { ...ctx.state, transactionId },
  }
})

export const POST = handleRequest
