import { Button } from "frames.js/next"
import { baseUrl, frames } from "../frames"

const handleRequest = frames(async () => {
    return {
    image: `${baseUrl}/poke/poke-start.jpg`,
    textInput: "Enter someones Lens Handle",
    buttons: [
      <Button action="post" key="button1" target="/send-poke">
        POKE! 👉
      </Button>,
    ],
    state: {}
  } 
})

export const GET = handleRequest
export const POST = handleRequest
