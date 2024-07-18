import { createFrames } from "frames.js/next"
import { openframes } from "frames.js/middleware"
import { getLensFrameMessage, isLensFrameActionPayload } from "frames.js/lens"
import { imagesWorkerMiddleware } from "frames.js/middleware/images-worker"
import { getXmtpFrameMessage, isXmtpFrameActionPayload } from "frames.js/xmtp"
import { farcasterHubContext } from "frames.js/middleware"
import * as fs from "node:fs/promises"
import * as path from "node:path"
import { verifyFrameSignature } from "../services/lens"

export type State = {
  owner?: string
  hand?: any
  table?: {
    remainingBalance: string
    size: string
    creator: string
  }
  dealerProfile?: {
    image?: string
    handle?: string
  }
  transactionId?: string
}

const isProduction = process.env.NODE_ENV === "production"

export const FEATURED_DEALER_PROFILE_ID = "0x73b1"
export const FEATURED_REMAINING_BAL = "10000000000000000000000" // 10,000
export const FEATURED_BET_SIZE = "1000000000000000000000" // 1,000

export const frames = createFrames<State>({
  baseUrl: isProduction ? "https://frames.bonsai.meme" : "http://localhost:3000",
  basePath: "/blackjack",
  debug: !isProduction,
  initialState: {},
  imagesRoute: "/images",
  imageRenderingOptions: async () => {
    const [regularFont, boldFont] = await Promise.all([
      fs.readFile(path.join(path.resolve(process.cwd(), "public"), "DegularDisplay-Thin.ttf")),
      fs.readFile(path.join(path.resolve(process.cwd(), "public"), "DegularDisplay-Semibold.ttf")),
    ])

    return {
      imageOptions: {
        fonts: [
          {
            name: "Degular",
            data: regularFont,
            weight: 400,
          },
          {
            name: "Degular",
            data: boldFont,
            weight: 700,
          },
        ],
      },
    }
  },
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
