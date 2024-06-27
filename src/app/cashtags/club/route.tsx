/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "../frames";
import { lensClient } from "@/app/services/lens";
import { CASHTAG_BG_URL, CASHTAG_DEX_URL } from "@/app/services/utils";

// HOME
const handleRequest = frames(async (ctx) => {
  const { moneyClubAddress, moneyClubProfileId } = ctx.searchParams;
  const profile = await lensClient.profile.fetch({ forProfileId: moneyClubProfileId });
  const moneyClub = { image: profile?.metadata?.picture?.optimized?.uri, handle: profile?.handle?.localName };

  return {
    image: (
      <div tw="flex w-full h-full items-center justify-center" style={{ backgroundImage: `url(${CASHTAG_BG_URL})`, backgroundSize: '100% 100%' }}>
        <div tw="flex flex-col items-center">
          <span tw="flex h-56 w-56 overflow-hidden rounded-full border-2 border-white">
            <img
              src={moneyClub.image}
              tw="h-full w-full"
            />
          </span>
          <div tw="flex justify-center items-center text-black mt-12 text-20" style={{ fontWeight: 1000 }}>
            ${moneyClub.handle}
          </div>
        </div>
      </div>
    ),
    buttons: [
      <Button action="link" target={`${CASHTAG_DEX_URL}?moneyClubAddress=${moneyClubAddress}`}>
        Dex
      </Button>,
      <Button action="post" target={{ pathname: "/club-check", query: { moneyClubAddress, moneyClubProfileId } }}>
        Check price
      </Button>
    ]
  };
});

export const GET = handleRequest;
export const POST = handleRequest;