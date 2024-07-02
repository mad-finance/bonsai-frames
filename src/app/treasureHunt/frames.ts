import { createFrames } from "frames.js/next"
import { openframes } from "frames.js/middleware"
import { getLensFrameMessage, isLensFrameActionPayload } from "frames.js/lens"
import { getXmtpFrameMessage, isXmtpFrameActionPayload } from "frames.js/xmtp"
import { farcasterHubContext } from "frames.js/middleware"
import { verifyFrameSignature } from "../services/lens"

export const clueImg =
  "https://link.storjshare.io/s/jxhlmunsaostfw7fy2pqurr2aahq/frames/clue.jpg?wrap=0"
export const clueFoundImg =
  "https://link.storjshare.io/s/jv3cn6nzok3umptp4bcp2tfs6xuq/frames/clue-found.jpg?wrap=0"
export const clueNotFoundImg =
  "https://link.storjshare.io/s/jxrxfp6cucye6r556lc7q7pj4vmq/frames/clue-not-found.jpg?wrap=0"
export const treasureImg =
  "https://link.storjshare.io/s/jvoxea66sehvbwaixgfjb43nv5ra/frames/treasure-found.jpg?wrap=0"

export type State = {
  owner?: string
  secret?: string
  transactionId?: string
}

const isProduction = process.env.NODE_ENV === "production"

export const frames = createFrames<State>({
  baseUrl: isProduction ? "https://frames.bonsai.meme" : "http://localhost:3000",
  basePath: "/treasureHunt",
  debug: process.env.NODE_ENV !== "production",
  imagesRoute: "/treasureHunt",
  middleware: [
    farcasterHubContext({
      hubHttpUrl: isProduction ? undefined : "https://nemes.farcaster.xyz:2281",
    }),
    openframes({
      clientProtocol: {
        id: "xmtp",
        version: "2024-02-09",
      },
      handler: {
        isValidPayload: (body: JSON) => isXmtpFrameActionPayload(body),
        getFrameMessage: async (body: JSON) => {
          if (!isXmtpFrameActionPayload(body)) {
            return undefined
          }
          const result = await getXmtpFrameMessage(body)

          return { ...result }
        },
      },
    }),
    openframes({
      clientProtocol: {
        id: "lens",
        version: "1.0.0",
      },
      handler: {
        isValidPayload: (body: JSON) => isLensFrameActionPayload(body),
        getFrameMessage: async (body: JSON) => {
          // verify the payload spec
          if (!isLensFrameActionPayload(body)) return undefined

          // verify is authenticated
          if (!(await verifyFrameSignature(body))) return undefined

          const result = await getLensFrameMessage(body)

          return { ...result }
        },
      },
    }),
  ],
})
