import { createFrames } from "frames.js/next"
import { openframes } from "frames.js/middleware"
import { getLensFrameMessage, isLensFrameActionPayload } from "frames.js/lens"
import { imagesWorkerMiddleware } from "frames.js/middleware/images-worker"
import { getXmtpFrameMessage, isXmtpFrameActionPayload } from "frames.js/xmtp"
import { farcasterHubContext } from "frames.js/middleware"
import { verifyFrameSignature } from "../services/lens"

export type State = {
  owner?: string
  game?: {
    startedAt: any
    isOver: any
    playerHand: any
    dealerHand: any
  }
  table?: {
    remainingBalance: string
    size: string
    creator: string
    gameCount: number
    pausedAt: number
  }
  dealerProfile?: {
    image?: string
    handle?: string
  }
  transactionId?: string
}

const isProduction = process.env.NODE_ENV === "production"
export const baseUrl = isProduction ? "https://frames.bonsai.meme" : "http://localhost:3000"

export const frames = createFrames<State>({
  baseUrl,
  basePath: "/blackjack",
  debug: !isProduction,
  initialState: {},
  imagesRoute: "/images",
  middleware: [
    imagesWorkerMiddleware({
      imagesRoute: "/images",
      secret: process.env.IMAGE_WORKER_SECRET,
    }),
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
