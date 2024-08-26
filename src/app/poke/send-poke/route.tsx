import { Button } from "frames.js/next"
import { baseUrl, frames } from "../frames"
import { convertIntToHexLensId, getProfileOwner } from "@/app/services/treasureHunt"
import {
  DEFAULT_POKE_AMOUNT,
  formatTimeRemaining,
  getPokeStatus,
  getUserAllowancePoke,
} from "@/app/services/poke"
import { formatUnits } from "viem"
import { getProfileById } from "@/app/services/lens"

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

  if (!pokeParams) {
    return {
      image: `${baseUrl}/poke/poke-handleError.jpg`,
      buttons: [
        <Button action="post" key="button1" target="/start">
          Back
        </Button>,
      ],
      state: { ...ctx.state },
    }
  }

  // handle allowance
  if (allowance < DEFAULT_POKE_AMOUNT) {
    return {
      image: `${baseUrl}/poke/poke-howto.jpg`,
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
  if (pokeParams.pokeStatus.lastPokeProfileId != Number(ctx.message?.profileId)) {
    buttons.push(
      <Button action="tx" key="button3" target="/poke-tx" post_url="/poke-sent">
        {(timeRemaining && timeRemaining > 0) || pokeParams.pokeStatus.lastPokeProfileId === 0
          ? "Poke"
          : "End"}
      </Button>
    )
  }

  // nothing found
  if (pokeParams.whoStartedIt == "0") {
    return {
      image: `${baseUrl}/poke/poke-noActivePokeGame.jpg`,
      buttons,
      state: updatedState,
    }
  }

  const [myProfile, otherProfile] = await Promise.all([
    getProfileById(ctx.message?.profileId),
    getProfileById(convertIntToHexLensId(updatedState.pokeParams?.toProfileId)),
  ])

  // console.log(myProfile, otherProfile)

  return {
    image: (
      <div
        tw="flex w-full h-full relative items-center justify-center"
        style={{
          backgroundImage: `url(${baseUrl}/poke/poke-gameBg.jpg)`,
          backgroundSize: "cover",
          fontWeight: 700,
          color: "#000000",
        }}
      >

        {/* Statics */}
        <div tw="flex w-full h-full absolute bottom-0px left-0px" style={{
          backgroundImage: `url(${baseUrl}/poke/poke-coins.png)`,
          backgroundSize: "cover",
        }}></div>


        {/* PFPs */}

        <div tw="flex w-80px h-80px absolute top-365px left-300px" style={{
          backgroundImage: `url(${baseUrl}/poke/pfp-placeholder-1.jpg)`,
          backgroundSize: "80px 80px",
          zIndex: 5,
        }}></div>
        <div tw="flex w-80px h-80px absolute top-365px left-760px" style={{
          backgroundImage: `url(${baseUrl}/poke/pfp-placeholder-2.jpg)`,
          backgroundSize: "80px 80px",
          zIndex: 5,
        }}></div>




        {/* Player One */ }
        <div tw="flex w-full h-full absolute top-0px left-0px" style={{
          backgroundImage: `url(${baseUrl}/poke/poke-player-1-pot.png)`,
          backgroundSize: "cover",
          zIndex: 10,
        }}></div>

        
        {/* Player Two */}
        <div tw="flex w-full h-full absolute top-0px left-0px" style={{
          backgroundImage: `url(${baseUrl}/poke/poke-player-2-pot.png)`,  
          backgroundSize: "cover",
          zIndex: 10,
        }}></div>






        {pokeParams.whoStartedIt.toString() === pokeParams.pokeStatus.lastPokeProfileId.toString() ? (
          <div tw="flex w-full h-full absolute top-0px left-0px">
            <div tw="flex w-full h-full absolute top-0px left-0px" style={{
              backgroundImage: `url(${baseUrl}/poke/poke-player-1-stem-point.png)`,
              backgroundSize: "cover",
              zIndex: 15,
            }}></div>
            <div tw="flex w-full h-full absolute top-0px left-0px" style={{
              backgroundImage: `url(${baseUrl}/poke/poke-player-1-face-smile.png)`,
              backgroundSize: "cover",         
              zIndex: 20,
            }}></div>
            <div tw="flex w-full h-full absolute top-0px left-0px" style={{
              backgroundImage: `url(${baseUrl}/poke/poke-player-2-stem-default.png)`,
              backgroundSize: "cover",
              zIndex: 15,
            }}></div>
            <div tw="flex w-full h-full absolute top-0px left-0px" style={{
              backgroundImage: `url(${baseUrl}/poke/poke-player-2-face-sleep.png)`,
              backgroundSize: "cover",
              zIndex: 20,
            }}></div>
            <div tw="flex w-full h-full absolute top-0px left-0px" style={{
              backgroundImage: `url(${baseUrl}/poke/poke-player-1-yourMove.png)`,
              backgroundSize: "cover",
              zIndex: 25,
            }}></div>
          </div>
        ) : (
            <div tw="flex w-full h-full absolute top-0px left-0px">
              <div tw="flex w-full h-full absolute bottom-0px left-0px" style={{
                backgroundImage: `url(${baseUrl}/poke/poke-player-1-stem-default.png)`,
                backgroundSize: "cover",
                zIndex: 15,
              }}></div>
              <div tw="flex w-full h-full absolute top-0px left-0px" style={{
                backgroundImage: `url(${baseUrl}/poke/poke-player-1-face-sleep.png)`,
                backgroundSize: "cover",
                zIndex: 20,
              }}></div>
              <div tw="flex w-full h-full absolute top-0px left-0px" style={{
                backgroundImage: `url(${baseUrl}/poke/poke-player-2-stem-point.png)`,
                backgroundSize: "cover",
                zIndex: 15,
              }}></div>
              <div tw="flex w-full h-full absolute top-0px left-0px" style={{
                backgroundImage: `url(${baseUrl}/poke/poke-player-2-face-smile.png)`,
                backgroundSize: "cover",
                zIndex: 20,
              }}></div>
              <div tw="flex w-full h-full absolute top-0px left-0px" style={{
                backgroundImage: `url(${baseUrl}/poke/poke-player-2-yourMove.png)`,
                backgroundSize: "cover",
                zIndex: 25,
              }}></div>
            </div>
        )}


        {/* Text Outputs */}

        <div tw="flex w-full h-full absolute top-0px left-0px items-center justify-center"
          style={{
            backgroundImage: `url(${baseUrl}/poke/poke-gameTexts.png)`,
            backgroundSize: "cover",
            zIndex: 30,
            fontWeight: 700,
            fontSize: "24px",
            color: "#FFFFFF",
          }}
        >
          <div tw="flex absolute top-535px left-90px">{formatUnits(BigInt(pokeParams.pokeStatus.amount), 18)}</div>
          <div tw="flex absolute top-535px left-523px">{pokeParams.pokeStatus.subgraphData.streak.toString()}</div>
          {timeRemaining &&
            (timeRemaining > 0 ? (
              <div tw="flex absolute top-535px left-878px">{formatTimeRemaining(timeRemaining)}</div>
            ) : (
              <div tw="flex">Game Over</div>
            ))}
        </div> 
        
        


        { /* }
        <div tw="flex">Poke-war started by: {pokeParams.whoStartedIt.toString()}</div>
        <div tw="flex">
          Poke war started at:{" "}
          {new Date(Number(pokeParams.pokeStatus.subgraphData.startedAt) * 1000)
            .toString()
            .substring(0, 25)}
        </div>


        <div tw="flex absolute top-540px left-0px">$Bonsai at stake  {formatUnits(BigInt(pokeParams.pokeStatus.amount), 18)}</div>
        <div tw="flex absolute top-540px left-200px">streak  {pokeParams.pokeStatus.subgraphData.streak.toString()}</div>
        {timeRemaining &&
          (timeRemaining > 0 ? (
          <div tw="flex absolute top-540px left-500px">Time remaining to poke back: {formatTimeRemaining(timeRemaining)}</div>
          ) : (
            <div tw="flex">Game Over</div>
          ))}

        <div tw="flex">
          Starting amount:{" "}
          {formatUnits(BigInt(pokeParams.pokeStatus.subgraphData.startingAmount), 18)}
        </div>
        <div tw="flex">
          Increment amount: {formatUnits(BigInt(pokeParams.pokeStatus.increment), 18)}
        </div>
        <div tw="flex">
          Total amount wagered: {formatUnits(BigInt(pokeParams.pokeStatus.amount), 18)}
        </div>
        <div tw="flex">Last poke was by: {pokeParams.pokeStatus.lastPokeProfileId.toString()}</div>
        <div tw="flex">Streak: {pokeParams.pokeStatus.subgraphData.streak.toString()}</div>
        {timeRemaining &&
          (timeRemaining > 0 ? (
            <div tw="flex">Time remaining for poke back: {formatTimeRemaining(timeRemaining)}</div>
          ) : (
            <div tw="flex">Game Over</div>
          ))}

          */ }
      </div>
    ),
    buttons,
    state: updatedState,
  }
})

export const GET = handleRequest
export const POST = handleRequest
