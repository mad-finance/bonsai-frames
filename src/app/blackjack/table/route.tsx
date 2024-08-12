import { Button } from "frames.js/next"
import { baseUrl, frames } from "../frames"
import {
  getTable,
  getTableId,
  getUserAllowance,
  getGameInfo,
  didPlayerWin,
  composeUrl,
} from "@/app/services/blackjack"
import { formatUnits } from "viem"
import { getProfileById } from "@/app/services/lens"
import { getProfileOwner } from "@/app/services/treasureHunt"

const suits = ["HE", "DI", "CL", "SP"]
const rankNames = ["NONE", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

const CardComponent = ({ card }) => {
  const suit = suits[card.suit]
  const rankName = rankNames[card.rank]
  return (
    <div
      tw="flex w-120px h-175px mx-10px"
      style={{
        backgroundImage: `url(${baseUrl}/blackjack/cards/${suit}-${rankName}.png)`,
        backgroundSize: "100% 100%",
      }}
    ></div>
  )
}

const handleRequest = frames(async (ctx) => {
  const tableId = getTableId(ctx)
  const owner = await getProfileOwner(ctx.message?.profileId)
  const [tableData, gameInfo, allowance] = await Promise.all([
    getTable(tableId),
    getGameInfo(tableId, owner),
    getUserAllowance(owner),
  ])

  console.log("tableId", tableId)

  const table = {
    tableId,
    remainingBalance: tableData[0].toString(),
    size: tableData[1].toString(),
    creator: tableData[2],
    gameCount: parseInt(tableData[3]),
    pausedAt: parseInt(tableData[4]),
  }

  const game = {
    ...gameInfo,
    startedAt: parseInt(gameInfo.startedAt),
  }

  // if table paused and can't start a new one
  if (game.startedAt === 0 && table.pausedAt !== 0) {
    return {
      image: `${baseUrl}/blackjack/blackjack-closed.jpg`,
      buttons: [
        <Button action="post" key="back-button" target="/start">
          Back to Start
        </Button>,
      ],
      state: { ...ctx.state, table, game, owner },
    }
  }

  // if game started and can't start a new one
  if (game.startedAt === 0 && table.gameCount >= table.remainingBalance / table.size) {
    return {
      image: `${baseUrl}/blackjack/blackjack-too-many.jpg`,
      buttons: [
        <Button action="post" key="back-button" target="/start">
          Back to Start
        </Button>,
      ],
      state: { ...ctx.state, table, game, owner },
    }
  }

  const currentTimestamp = Math.floor(Date.now() / 1000)
  const isGameExpired = game.startedAt > 0 && currentTimestamp - game.startedAt > 24 * 60 * 60

  // if game timed out
  if (isGameExpired) {
    return {
      image: (
        <div
          tw="flex w-full h-full relative items-center justify-center"
          style={{
            backgroundImage: `url(${baseUrl}/blackjack/blackjack-default.jpg)`,
            backgroundSize: "cover",
            fontFamily: "'Verdana', monospace",
            fontWeight: 700,
            color: "#FFFFFF",
          }}
        >
          <div tw="flex flex-col items-center">
            <p tw="text-4xl mb-4">Game Over</p>
            <p tw="text-xl">This game has expired past the 24 hour time limit.</p>
            <p tw="m-10">You will need to close out this game to start a new one.</p>
          </div>
        </div>
      ),
      buttons: [
        <Button action="post" key="back-button" target="/start">
          Back to Start
        </Button>,
        <Button action="tx" key="close-button" target="/close-tx" post_url="/table">
          Close Game
        </Button>,
      ],
      state: { ...ctx.state, table, game, owner },
    }
  }

  // can't play against yourself
  if (owner?.toLowerCase() === table.creator.toLowerCase()) {
    return {
      image: (
        <div
          tw="flex w-full h-full relative items-center justify-center"
          style={{
            backgroundImage: `url(${baseUrl}/blackjack/blackjack-default.jpg)`,
            backgroundSize: "cover",
            fontFamily: "'Verdana', monospace",
            fontWeight: 700,
            color: "#FFFFFF",
          }}
        >
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
      state: { ...ctx.state, table, game, owner },
    }
  }

  // if need to approve bonsai
  if (allowance < table.size && game.playerHand?.length === 0) {
    return {
      image: (
        <div
          tw="flex w-full h-full relative items-center justify-center"
          style={{
            backgroundImage: `url(${baseUrl}/blackjack/blackjack-table-approve.jpg)`,
            backgroundSize: "cover",
            fontFamily: "'Verdana', monospace",
            fontWeight: 700,
            color: "#FFFFFF",
          }}
        >
          <p
            tw="m-0 w-400px h-20px absolute bottom-135px left-280px items-left"
            style={{
              fontFamily: "'Verdana', monospace",
              fontWeight: 700,
              fontSize: "50px",
              color: "red",
            }}
          >
            {formatUnits(table.size, 18)} $BONSAI
          </p>
        </div>
      ),
      buttons: [
        <Button action="post" key="status-button" target="/start">
          Back
        </Button>,
        <Button action="tx" key="approve-button" target="/approve-tx" post_url="/table">
          Approve $BONSAI
        </Button>,
      ],
      state: { ...ctx.state, table, game, owner },
    }
  }

  // if game has been won/lost
  if (game.isOver) {
    const playerWon = didPlayerWin(game)
    const [profileId, _] = ctx.message?.pubId.split("-")
    const profile = await getProfileById(profileId)
    const shareUrl = composeUrl(
      `Play against @${profile?.handle?.fullHandle} at Bonsai Blackjack! ♦️♣️♥️♠️`,
      `https://frames.bonsai.meme/blackjack/start?table=${tableId}`,
      "lens"
    )
    const buttons = [
      <Button action="link" key="share" target={shareUrl}>
        Share Table 🦋
      </Button>,
      <Button action="tx" key="close-button" target="/close-tx" post_url="/table">
        Close Game
      </Button>,
    ]

    return {
      image: (
        <div
          tw="flex w-full h-full relative"
          style={{
            backgroundImage: `url(${baseUrl}/blackjack/${
              playerWon ? "blackjack-table-won.jpg" : "blackjack-table-lost.jpg"
            })`,
            backgroundSize: "cover",
            fontFamily: "'Verdana', monospace",
            fontWeight: 700,
            color: "#FFFFFF",
          }}
        >
          <div
            tw="flex items-center justify-center auto-rows-auto flex-col"
            style={{
              fontSize: "40px",
              fontFamily: "DegularDisplay",
              color: "#FFFFFF",
            }}
          >
            <p tw="flex w-1150px h-200px absolute top-10px left-115px" style={{ fontSize: "45px" }}>
              {formatUnits(table.size, 18)}{" "}
              <span tw="relative top-16px left-10px" style={{ fontSize: "30px" }}>
                $BONSAI
              </span>
            </p>

            <div tw="flex w-1150px h-200px absolute bottom-340px left-0px items-center justify-center">
              {game.dealerHand?.map((card, i) => (
                <CardComponent card={card} key={i} />
              ))}
            </div>
            <div tw="flex w-1150px h-200px absolute bottom-60px left-0px items-center justify-center">
              {game.playerHand?.map((card, i) => (
                <CardComponent card={card} key={i} />
              ))}
            </div>
          </div>
        </div>
      ),
      buttons,
      state: { ...ctx.state, table, game, owner },
    }
  }

  const buttons = [
    <Button action="post" key="status-button" target="/table">
      Refresh
    </Button>,
    <Button action="tx" key="hit-button" target="/hit-tx" post_url="/table">
      {game.playerHand?.length === 0 ? "Deal First Hand" : "Hit"}
    </Button>,
  ]

  if (game.playerHand?.length > 0) {
    buttons.push(
      <Button action="tx" key="stand-button" target="/stand-tx" post_url="/table">
        Stand
      </Button>
    )
  }

  return {
    image: (
      <div
        tw="flex w-full h-full relative"
        style={{
          backgroundImage: `url(${baseUrl}/blackjack/${
            game.playerHand?.length === 0
              ? "blackjack-table-empty.jpg"
              : "blackjack-table-active-game.jpg"
          })`,
          backgroundSize: "cover",
          fontFamily: "'Verdana', monospace",
          fontWeight: 700,
          color: "#FFFFFF",
        }}
      >
        <div
          tw="flex items-center justify-center auto-rows-auto flex-col"
          style={{
            fontSize: "40px",
            fontFamily: "DegularDisplay",
            color: "#FFFFFF",
          }}
        >
          <p tw="flex w-1150px h-200px absolute top-10px left-115px" style={{ fontSize: "45px" }}>
            {formatUnits(table.size, 18)}{" "}
            <span tw="relative top-16px left-10px" style={{ fontSize: "30px" }}>
              $BONSAI
            </span>
          </p>

          <div tw="flex w-1150px h-200px absolute bottom-325px left-0px items-center justify-center">
            {game.dealerHand?.map((card, i) => (
              <CardComponent card={card} key={i} />
            ))}
          </div>
          <div tw="flex w-1150px h-200px absolute bottom-75px left-0px items-center justify-center">
            {game.playerHand?.map((card, i) => (
              <CardComponent card={card} key={i} />
            ))}
          </div>
        </div>
      </div>
    ),
    buttons,
    state: { ...ctx.state, table, game, owner },
  }
})

export const GET = handleRequest
export const POST = handleRequest
