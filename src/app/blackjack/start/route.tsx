import { Button } from "frames.js/next"
import { frames } from "../frames"

const handleRequest = frames(async () => {
  return {
    image: (
      <div tw="flex w-full h-full items-center justify-center">
        <div tw="flex flex-col items-center">Play Bonsai Blackjack</div>
      </div>
    ),
    buttons: [
      <Button action="post" key="button" target="/table">
        Play
      </Button>,
    ],
  }
})

export const GET = handleRequest
export const POST = handleRequest
