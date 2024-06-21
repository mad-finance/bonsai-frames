import { createFrames } from "frames.js/next";
import { openframes } from "frames.js/middleware";
import { getLensFrameMessage, isLensFrameActionPayload } from "frames.js/lens";
import { imagesWorkerMiddleware } from "frames.js/middleware/images-worker";
import { getXmtpFrameMessage, isXmtpFrameActionPayload } from "frames.js/xmtp";
import { farcasterHubContext } from "frames.js/middleware";
import { verifyFrameSignature } from "../services/lens";

export type State = {
  moneyClubProfileId?: string;
  moneyClubAddress?: string;
  currentPrice?: string;
  walletAddress?: string;
  moneyClub?: {
    image?: string;
    handle?: string;
  };
  transactionId?: string;
};

const isProduction = process.env.NODE_ENV === "production";

// frames.bonsai.meme/frames/club?moneyClubAddress=0x123&moneyClubProfileId=0x123

// TODO: fetch featured profile from db/subgraph
export const FEATURED_CLUB_PROFILE_ID = "0x73b1";
export const FEATURED_CLUB_ADDRESS = "0x36a8e6d4d704e422852bbefbdd9d93a2472d915e";

export const frames = createFrames<State>({
  baseUrl: isProduction ? process.env.VERCEL_URL : "http://madfi.ngrok.io",
  basePath: "/cashtags",
  debug: !isProduction,
  initialState: {},
  imagesRoute: isProduction ? "/images" : "http://madfi.ngrok.io/cashtags/images",
  middleware: [
    imagesWorkerMiddleware({
      imagesRoute: isProduction ? "/images" : "http://madfi.ngrok.io/cashtags/images",
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
            return undefined;
          }
          const result = await getXmtpFrameMessage(body);

          return { ...result };
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
          if (!isLensFrameActionPayload(body)) return undefined;

          // TODO: not working
          // // verify is authenticated
          // if (!await verifyFrameSignature(body)) return undefined;

          const result = await getLensFrameMessage(body);

          return { ...result };
        },
      },
    }),
  ]
});