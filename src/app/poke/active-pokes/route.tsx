import { Button } from "frames.js/next"
import { baseUrl, frames } from "../frames"
import { getAllMyActivePokes } from "@/app/services/poke"
import { getHandleById } from "@/app/services/lens"
import { convertIntToHexLensId } from "@/app/services/treasureHunt"

const handleRequest = frames(async (ctx) => {
  const activePokes = await getAllMyActivePokes(Number(ctx.message?.profileId))
  console.log(ctx.message?.profileId, activePokes)

  const startedByMeWithHandles = await Promise.all(
    activePokes.startedByMe.map(async (poke) => ({
      ...poke,
      opponentHandle: await getHandleById(convertIntToHexLensId(poke.toProfileId)),
    }))
  )

  const toMeWithHandles = await Promise.all(
    activePokes.toMe.map(async (poke) => ({
      ...poke,
      opponentHandle: await getHandleById(convertIntToHexLensId(poke.startedByProfileId)),
    }))
  )

  const updatedActivePokes = {
    startedByMe: startedByMeWithHandles,
    toMe: toMeWithHandles,
  }
  return {
    image: (
      <div
        tw="flex w-full h-full p-4"
        style={{
          backgroundImage: `url(${baseUrl}/poke/poke-start-trans.jpg)`,
          backgroundSize: "cover",
          fontWeight: 700,
          color: "#000000",
        }}
      >
        <div tw="flex flex-col w-full h-full">
          <div tw="flex flex-col">
            <h2 tw="text-6xl font-bold">Pokes Started by Me:</h2>
            <div tw="flex flex-wrap">
              {updatedActivePokes.startedByMe.map((poke, index) => (
                <span
                  key={index}
                  tw={`pr-6 text-5xl ${
                    Number(ctx.message?.profileId) === Number(poke.lastPokeProfileId)
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  @{poke.opponentHandle}
                </span>
              ))}
            </div>
          </div>
          <div tw="flex flex-col">
            <h2 tw="text-6xl font-bold">Pokes to Me:</h2>
            <div tw="flex flex-wrap">
              {updatedActivePokes.toMe.map((poke, index) => (
                <span
                  key={index}
                  tw={`pr-6 text-5xl ${
                    Number(ctx.message?.profileId) === Number(poke.lastPokeProfileId)
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  @{poke.opponentHandle}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    textInput: "Enter someones Lens Handle",
    buttons: [
      <Button action="post" key="button1" target="/start">
        Back
      </Button>,
      <Button action="post" key="button1" target="/send-poke">
        POKE! 👉
      </Button>,
    ],
    state: {},
  }
})

export const GET = handleRequest
export const POST = handleRequest
