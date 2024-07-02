import { Button } from "frames.js/next"
import { clueFoundImg, clueImg, frames, treasureImg } from "../frames"
import { ctxToFound, ctxToTreasureFound, getProfileOwner } from "@/app/services/treasureHunt"

const handleRequest = frames(async (ctx) => {
  const owner = await getProfileOwner(ctx.message?.profileId)
  const [found, treasureFound] = await Promise.all([
    ctxToFound(ctx, owner),
    ctxToTreasureFound(ctx, owner),
  ])

  if (treasureFound) {
    return {
      image: treasureImg,
      buttons: [
        <Button action="post" key="button" target="/start">
          ⬅️ Back
        </Button>,
      ],
      state: { ...ctx.state, owner },
    }
  } else if (found) {
    return {
      image: clueFoundImg,
      buttons: [
        <Button action="post" key="button" target="/start">
          ⬅️ Back
        </Button>,
      ],
      state: { ...ctx.state, owner },
    }
  } else {
    return {
      image: clueImg,
      textInput: "Enter the secret phrase...",
      buttons: [
        <Button action="post" key="button1" target="/send-clue">
          Check Secret Phrase
        </Button>,
        <Button action="post" key="button2" target="/clue-found">
          Check Status
        </Button>,
      ],
      state: { ...ctx.state, owner },
    }
  }
})

export const GET = handleRequest
export const POST = handleRequest
