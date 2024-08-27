import { Button } from "frames.js/next"
import { baseUrl, frames } from "../frames"
import { getAllMyActivePokes } from "@/app/services/poke"

const handleRequest = frames(async () => {
    return {
      image: (
        <div
          tw="flex w-full h-full relative items-center justify-center"
          style={{
            backgroundImage: `url(${baseUrl}/poke/poke-start.jpg)`,
            backgroundSize: "cover",
            fontWeight: 700,
            color: "#000000",
          }}
        >
          <div tw="text-center"> </div>
        </div>
      ),
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
