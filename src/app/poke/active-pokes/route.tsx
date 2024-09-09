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
          backgroundImage: `url(${baseUrl}/poke/poke-activePokesBG.jpg)`,
          backgroundSize: "cover",
          fontWeight: 700,
          color: "#000000",
        }}
      >
        <div tw="flex flex-col w-full h-full">
          <div tw="flex flex-col">
            <div tw="flex w-full h-15 mt-20 mb-2" style={{
              backgroundImage: `url(${baseUrl}/poke/titlePokesStartedByMe.png)`,
              backgroundSize: "auto 100%",
              backgroundRepeat: "no-repeat",
            }}></div>
            <div tw="flex flex-wrap">
              {updatedActivePokes.startedByMe.map((poke, index) => (
                <span
                  key={index}
                  tw={`text-4xl text-white px-5 py-2 m-2 rounded-lg border-neutral-500 border-2 ${Number(ctx.message?.profileId) === Number(poke.lastPokeProfileId)
                      ? "bg-lime-700"
                      : "bg-rose-600"
                    }`}
                >
                  @{poke.opponentHandle}
                </span>
              ))}
            </div>
          </div>
          <div tw="flex flex-col">
            <div tw="flex w-full h-15 mt-15 mb-2" style={{
              backgroundImage: `url(${baseUrl}/poke/titlePokesStartedBySomeoneElse.png)`,
              backgroundSize: "auto 100%",
              backgroundRepeat: "no-repeat",
            }}></div>
            <div tw="flex flex-wrap">
              {updatedActivePokes.toMe.map((poke, index) => (
                <span
                  key={index}
                  tw={`text-4xl text-white px-5 py-2 m-2 rounded-lg border-neutral-500 border-2  ${Number(ctx.message?.profileId) === Number(poke.lastPokeProfileId)
                    ? "bg-lime-700"
                    : "bg-rose-600"
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
