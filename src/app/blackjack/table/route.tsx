import { Button } from "frames.js/next"
import { baseUrl, frames } from "../frames"
import { getProfileOwner } from "@/app/services/treasureHunt"
import {
  getTable,
  getTableId,
  getUserAllowance,
  getGameInfo,
  didPlayerWin,
} from "@/app/services/blackjack"
import { formatUnits } from "viem"

const suits = ["HE", "DI", "CL", "SP"]
const rankNames = ["NONE", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

const CardComponent = ({ card }) => {
  const suit = suits[card.suit]
  const rankName = rankNames[card.rank]
  return (
    <div
      tw="flex w-140px h-200px mx-10px"
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

  const table = {
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

  // if game started and can't start a new one
  if (
    game.startedAt === 0 &&
    (table.pausedAt !== 0 || table.gameCount >= table.remainingBalance / table.size)
  ) {
    return {
      image: (
        <div
          tw="flex w-full h-full relative items-center justify-center"
          style={{
            backgroundImage: `url(${baseUrl}/blackjack/blackjack-table-bg.jpg)`,
            backgroundSize: "cover",
            fontFamily: "'Verdana', monospace",
            fontWeight: 700,
            color: "#FFFFFF",
          }}
        >
          <div tw="flex flex-col items-center">
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p tw="m-10">Error</p>
            <p tw="m-4">Unable to start a game right now.</p>
            <p tw="m-0">The table may be paused or there may be</p>
            <p tw="m-0">too many open games right now.</p>
            <p>&nbsp;</p>
          </div>
        </div>
      ),
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
            backgroundImage: `url(${baseUrl}/blackjack/blackjack-table-bg.jpg)`,
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
        <Button action="tx" key="close-button" target="/close-tx" post_url="/play-status">
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
            backgroundImage: `url(${baseUrl}}/blackjack/blackjack-table-bg.jpg)`,
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
            backgroundImage: `url(${baseUrl}/blackjack/blackjack-table-bg.jpg)`,
            backgroundSize: "cover",
            fontFamily: "'Verdana', monospace",
            fontWeight: 700,
            color: "#FFFFFF",
          }}
        >
          <div tw="flex flex-col items-center">
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p tw="m-0">Approve the Blackjack contract to spend your tokens.</p>
            <p tw="m-0">(You must deposit your bet in order to start a game.)</p>
            <p tw="m-10">This is required to play.</p>
            <p tw="m-0">Bet size is: {formatUnits(table.size, 18)} $BONSAI</p>
            <p>&nbsp;</p>
          </div>
        </div>
      ),
      buttons: [
        <Button action="post" key="status-button" target="/start">
          Back
        </Button>,
        <Button action="tx" key="approve-button" target="/approve-tx" post_url="/approve-status">
          Approve $BONSAI
        </Button>,
      ],
      state: { ...ctx.state, table, game, owner },
    }
  }

  // if game has been won/lost
  if (game.isOver) {
    const playerWon = didPlayerWin(game)
    const buttons = [
      <Button action="tx" key="close-button" target="/close-tx" post_url="/play-status">
        Close Game
      </Button>,
    ]

    return {
      image: (
        <div
          tw="flex w-full h-full relative"
          style={{
            backgroundImage: `url(${baseUrl}/blackjack/blackjack-table-bg2.jpg)`,
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
            <p tw="flex w-1150px h-200px absolute top-20px left-135px" style={{ fontSize: "40px" }}>
              {formatUnits(table.size, 18)}{" "}
              <span tw="relative top-12px left-10px" style={{ fontSize: "30px" }}>
                $BONSAI
              </span>
            </p>

            <h2
              tw="flex w-1150px h-20px absolute -top-10px left-0px items-center justify-center"
              style={{ fontSize: "20px" }}
            >
              D&nbsp;E&nbsp;A&nbsp;L&nbsp;E&nbsp;R&nbsp;&apos;&nbsp;S&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;H&nbsp;A&nbsp;N&nbsp;D
            </h2>
            <h2
              tw="flex w-1150px h-20px absolute top-500px left-0px items-center justify-center"
              style={{ fontSize: "20px" }}
            >
              Y&nbsp;O&nbsp;U&nbsp;R&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;H&nbsp;A&nbsp;N&nbsp;D
            </h2>

            <div tw="flex w-1150px h-200px absolute bottom-320px left-0px items-center justify-center">
              {game.dealerHand?.map((card, i) => (
                <CardComponent card={card} key={i} />
              ))}
            </div>
            <div tw="flex w-1150px h-200px absolute bottom-70px left-0px items-center justify-center">
              {game.playerHand?.map((card, i) => (
                <CardComponent card={card} key={i} />
              ))}
            </div>

            <div tw="flex w-1150px items-center justify-center">
              <p
                tw={`${
                  playerWon ? "bg-green-500" : "bg-red-500"
                } px-10 py-6 rounded-full text-4xl font-bold`}
              >
                {playerWon ? "You Win! 🎉" : "You Lost :("}
              </p>
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
    <Button action="tx" key="hit-button" target="/hit-tx" post_url="play-status">
      {game.playerHand?.length === 0 ? "Deal First Hand" : "Hit"}
    </Button>,
  ]

  if (game.playerHand?.length > 0) {
    buttons.push(
      <Button action="tx" key="stand-button" target="/stand-tx" post_url="play-status">
        Stand
      </Button>
    )
  }

  return {
    image: (
      <div
        tw="flex w-full h-full relative"
        style={{
          backgroundImage: `url(${baseUrl}/blackjack/blackjack-table-bg2.jpg)`,
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
          <p tw="flex w-1150px h-200px absolute top-20px left-135px" style={{ fontSize: "40px" }}>
            {formatUnits(table.size, 18)}{" "}
            <span tw="relative top-12px left-10px" style={{ fontSize: "30px" }}>
              $BONSAI
            </span>
          </p>

          <h2
            tw="flex w-1150px h-20px absolute -top-10px left-0px items-center justify-center"
            style={{ fontSize: "20px" }}
          >
            D&nbsp;E&nbsp;A&nbsp;L&nbsp;E&nbsp;R&nbsp;&apos;&nbsp;S&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;H&nbsp;A&nbsp;N&nbsp;D
          </h2>
          <h2
            tw="flex w-1150px h-20px absolute top-500px left-0px items-center justify-center"
            style={{ fontSize: "20px" }}
          >
            Y&nbsp;O&nbsp;U&nbsp;R&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;H&nbsp;A&nbsp;N&nbsp;D
          </h2>

          <div tw="flex w-1150px h-200px absolute bottom-320px left-0px items-center justify-center">
            {game.dealerHand?.map((card, i) => (
              <CardComponent card={card} key={i} />
            ))}
          </div>
          <div tw="flex w-1150px h-200px absolute bottom-70px left-0px items-center justify-center">
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
