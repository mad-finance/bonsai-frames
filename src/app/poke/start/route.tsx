import { Button } from "frames.js/next"
import { frames } from "../frames"

const handleRequest = frames(async () => {
  return {
    image: (
      <div tw="flex">
        <p>Enter the Lens handle of someone to poke</p>
      </div>
    ),
    textInput: "Enter a handle...",
    buttons: [
      <Button action="post" key="button1" target="/send-poke">
        Check Handle
      </Button>,
    ],
    state: {}
  }
})

export const GET = handleRequest
export const POST = handleRequest
