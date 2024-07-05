/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "../frames";
import { lensClient } from "@/app/services/lens";
import { CASHTAG_BG_URL, CASHTAG_DEX_URL } from "@/app/services/utils";
import { ProfileInfo } from "@/app/components/cashtags";

// HOME
const handleRequest = frames(async (ctx) => {
  const { moneyClubAddress, moneyClubProfileId } = ctx.searchParams;
  const profile = await lensClient.profile.fetch({ forProfileId: moneyClubProfileId });
  const moneyClub = { image: profile?.metadata?.picture?.optimized?.uri, handle: profile?.handle?.localName };

  return {
    image: (
      <div tw="flex w-full h-full items-center justify-center" style={{ backgroundImage: `url(${CASHTAG_BG_URL})`, backgroundSize: '100% 100%' }}>
        <div tw="flex flex-col items-center">
          <ProfileInfo image={moneyClub.image} handle={moneyClub.handle!} />
        </div>
      </div>
    ),
    buttons: [
      <Button action="link" target={`${CASHTAG_DEX_URL}/?address=${moneyClubAddress}`}>
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