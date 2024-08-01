import { Button } from "frames.js/next"
import { baseUrl, frames } from "../frames"
import { BLACKJACK_ADDRESS } from "@/app/services/blackjack"

const handleRequest = frames(async () => {
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
          <p tw="m-10">Play blackjack against the creator of this post.</p>
          <p tw="m-0">Try to get your card count as close to 21 without going over.</p>
          <p tw="m-0">Winner will receive the bet size of the table.</p>
          <p tw="mt-6">&quot;HIT&quot; the dealer to get another card</p>
          <p tw="m-0">&quot;STAND&quot; to keep your hand and see results.</p>
          <p>&nbsp;</p>
        </div>
      </div>
    ),
    buttons: [
      <Button action="post" key="button" target="/start">
        Back
      </Button>,
      <Button
        action="link"
        key="contract"
        target={`https://polygonscan.com/address/${BLACKJACK_ADDRESS}`}
      >
        View Contract
      </Button>,
    ],
  }
})

export const GET = handleRequest
export const POST = handleRequest
