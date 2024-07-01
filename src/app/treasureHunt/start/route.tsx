import { Button } from "frames.js/next"
import { clueImg, frames } from "../frames"

const handleRequest = frames(async () => {
  return {
    image: clueImg,
    buttons: [
      <Button action="post" key="button" target="/clue">
        Check for a clue
      </Button>,
    ],
  }
})

export const GET = handleRequest
export const POST = handleRequest
