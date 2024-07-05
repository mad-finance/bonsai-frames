import { Button } from "frames.js/next"
import { clueImg, frames } from "../frames"
import { TREASURE_HUNT_ADDRESS, hashedSecret, simulateAct } from "@/app/services/treasureHunt"

const handleRequest = frames(async (ctx) => {
  const secret = hashedSecret(ctx.message?.inputText)
  const pubParts = ctx.message?.pubId.split("-")

  const success = await simulateAct(
    {
      publicationActedProfileId: pubParts[0],
      publicationActedId: pubParts[1],
      actorProfileId: ctx.message?.profileId,
      referrerProfileIds: [],
      referrerPubIds: [],
      actionModuleAddress: TREASURE_HUNT_ADDRESS,
      actionModuleData: secret,
    },
    ctx.state.owner
  )

  if (success) {
    return {
      image: clueImg,
      buttons: [
        <Button action="post" key="button1" target="/clue">
          ⬅️ Back
        </Button>,
        <Button action="tx" key="button2" target="/clue-tx" post_url="/clue-found">
          Send Clue!
        </Button>,
      ],
      state: { ...ctx.state, secret },
    }
  } else {
    return {
      image: clueImg,
      buttons: [
        <Button action="post" key="button1" target="/clue">
          ❌ Try Another
        </Button>,
      ],
      state: { ...ctx.state },
    }
  }
})

export const GET = handleRequest
export const POST = handleRequest
