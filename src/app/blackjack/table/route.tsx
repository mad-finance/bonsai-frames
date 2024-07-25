import { Button } from "frames.js/next"
import { frames } from "../frames"
import { getProfileOwner } from "@/app/services/treasureHunt"
import {
  getTable,
  getTableId,
  getUserAllowance,
  getUserHand,
  prettifyHand,
} from "@/app/services/blackjack"
import { formatUnits } from "viem"

const handleRequest = frames(async (ctx) => {
  const tableId = getTableId(ctx)
  const owner = await getProfileOwner(ctx.message?.profileId)
  const [tableData, currentHand, allowance] = await Promise.all([
    getTable(tableId),
    getUserHand(tableId, owner),
    getUserAllowance(owner),
  ])

  const table = {
    remainingBalance: tableData[0].toString(),
    size: tableData[1].toString(),
    creator: tableData[2],
  }
  console.log(tableId, owner, currentHand)

  if (owner?.toLowerCase() === table.creator.toLowerCase()) {
    return {
      image: (
        <div tw="flex w-full h-full relative items-center justify-center" style={{
          backgroundImage: `url(http://localhost:3000/blackjack/blackjack-table-bg.jpg)`,
          backgroundSize: 'cover',
          fontFamily: "'Verdana', monospace",
          fontWeight: 700,
          color: '#FFFFFF'
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
      state: { ...ctx.state, table, currentHand, owner },
    }
  }

  if (allowance < table.size) {
    return {
      image: (

        <div tw="flex w-full h-full relative items-center justify-center" style={{
          backgroundImage: `url(http://localhost:3000/blackjack/blackjack-table-bg.jpg)`,
          backgroundSize: 'cover',
          fontFamily: "'Verdana', monospace",
          fontWeight: 700,
          color: '#FFFFFF'
        }}
        >
          <div tw="flex flex-col items-center">
            <p>Approve the Blackjack contract to spend your tokens</p>
            <p>This is required to play - no tokens will be transferred unless you lose the hand</p>
          </div>
        </div>
      ),
      buttons: [
        <Button action="post" key="status-button" target="/table">
          Back
        </Button>,
        <Button action="tx" key="approve-button" target="/approve-tx" post_url="/approve-status">
          Approve $BONSAI
        </Button>,
      ],
      state: { ...ctx.state, table, currentHand, owner },
    }
  }

  const buttons = [
    <Button action="post" key="status-button" target="/table">
      Refresh
    </Button>,
    <Button action="tx" key="hit-button" target="/hit-tx" post_url="play-status">
      Hit
    </Button>,
  ]

  if (currentHand.length > 0) {
    buttons.push(
      <Button action="tx" key="stand-button" target="/stand-tx" post_url="play-status">
        Stand
      </Button>
    )
  }


  
  const suitEmojis = ["HE", "DI", "CL", "SP"]
  const rankNames = ["NONE", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]


  return {
    image: (
      <div tw="flex w-full h-full relative" style={{
        backgroundImage: `url(http://localhost:3000/blackjack/blackjack-table-bg2.jpg)`,
        backgroundSize: 'cover',
        fontFamily: "'Verdana', monospace",
        fontWeight: 700,
        color: '#FFFFFF'
      }}
      >

        <div tw="flex items-center justify-center auto-rows-auto flex-col" style={{
          fontSize: '40px',
          fontFamily: 'DegularDisplay',
          color: '#FFFFFF'
        }}>


          <p tw="flex w-1150px h-200px absolute top-20px left-135px" style={{ fontSize: '40px' }}>22{formatUnits(table.remainingBalance, 18)} <span tw="relative top-12px left-10px"  style={{ fontSize: '30px' }}>$BONSAI</span></p>


          <h2 tw="flex w-1150px h-20px absolute top-500px left-0px items-center justify-center" style={{ fontSize: '20px' }}>Y&nbsp;O&nbsp;U&nbsp;R&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;H&nbsp;A&nbsp;N&nbsp;D</h2>
        <div tw="flex w-1150px h-200px absolute bottom-70px left-0px items-center justify-center">


            {currentHand.map((card, i) => {
              const suitEmoji = suitEmojis[card.suit]
              const rankName = rankNames[card.rank]
              return (
                <div
                  tw="flex w-140px h-201px mx-10px"
                  key={i}
                  style={{
                    backgroundImage: `url(http://localhost:3000/blackjack/cards/${suitEmoji}-${rankName}.png)`,
                    backgroundSize: "100% 100%",
                  }}
                ></div>
              )
            })} 

          </div>


 
          { /* }

            <div tw="flex w-140px h-200px mx-10px" style={{
              backgroundImage: `url(http://localhost:3000/blackjack/cards/CL-J.png)`,
              backgroundSize: '100% 100%',
              fontSize: '0px',
            }}
            ></div>


          <h2 tw="" style={{ fontSize: '30px', display: 'block', color: 'red'}}>Allo:</h2>
          <p tw="" style={{ fontSize: '60px'}}>{formatUnits(table.remainingBalance, 18)} $BONSAI</p>
          
          <h2 tw="break-after-column">Bet size: {formatUnits(table.size, 18)}</h2>
            { */ }

        </div>
      </div>
    ),
    buttons,
    state: { ...ctx.state, table, currentHand, owner },
  }
})

export const GET = handleRequest
export const POST = handleRequest
