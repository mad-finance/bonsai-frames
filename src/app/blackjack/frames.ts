import { createFrames } from "frames.js/next"
import { openframes } from "frames.js/middleware"
import { getLensFrameMessage, isLensFrameActionPayload } from "frames.js/lens"
import { imagesWorkerMiddleware } from "frames.js/middleware/images-worker"
import { getXmtpFrameMessage, isXmtpFrameActionPayload } from "frames.js/xmtp"
import { farcasterHubContext } from "frames.js/middleware"
import { verifyFrameSignature } from "../services/lens"

export type State = {
  dealerProfileId: string
  remainingBalance: string | number
  betSize: string | number
  table?: {
    profileId: string
    pubId: string
    tableId: string
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
  basePath: "/blackjack",
  initialState: {
    dealerProfileId: FEATURED_DEALER_PROFILE_ID,
    remainingBalance: FEATURED_REMAINING_BAL,
    betSize: FEATURED_BET_SIZE,
  },
  debug: process.env.NODE_ENV !== "production",
  middleware: [
    imagesWorkerMiddleware({
      imagesRoute: isProduction ? "/images" : "http://madfi.ngrok.io/blackjack/images",
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

          // TODO: not working
          // // verify is authenticated
          // if (!await verifyFrameSignature(body)) return undefined;

          const result = await getLensFrameMessage(body)

          return { ...result }
        },
      },
    }),
  ],
})
