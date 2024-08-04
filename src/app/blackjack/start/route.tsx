import { Button } from "frames.js/next"
import { baseUrl, frames } from "../frames"

const handleRequest = frames(async () => {
  return {
    image: (
      <div
        tw="flex w-full h-full items-center justify-center"
        style={{
          backgroundImage: `url(${baseUrl}/blackjack/blackjack-start.jpg)`,
          backgroundSize: "cover",
        }}
      ></div>
    ),
    buttons: [
      <Button action="post" key="button" target="/learn">
        How to Play
      </Button>,
      <Button action="post" key="button" target="/table">
        Start Playing ♠ ♥ ♦ ♣
      </Button>,
    ],
  }
})

export const GET = handleRequest
export const POST = handleRequest
