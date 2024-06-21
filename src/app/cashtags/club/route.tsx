/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "../frames";
import { lensClient } from "@/app/services/lens";

// HOME
const handleRequest = frames(async (ctx) => {
  const { moneyClubAddress, moneyClubProfileId } = ctx.searchParams;
  const currentState = ctx.state;
  const profile = await lensClient.profile.fetch({ forProfileId: moneyClubProfileId });
  const moneyClub = { image: profile?.metadata?.picture?.optimized?.uri, handle: profile?.handle?.localName };

  const updatedState = {
    ...currentState,
    moneyClubAddress,
    moneyClubProfileId,
    moneyClub,
  };

  return {
    image: (
      <span tw="flex flex-col">
        <div tw="flex flex-col items-center">
          <span tw="flex h-48 w-48 overflow-hidden rounded-full border-8 border-gray-800">
            <img
              src={moneyClub.image}
              tw="h-full w-full"
            />
          </span>
          <div tw="flex justify-center items-center bg-gray-800 text-white font-bold rounded-xl py-3 px-4 mt-10">
            ${moneyClub.handle}
          </div>
        </div>
      </span>
    ),
    buttons: [
      <Button action="post" target={{ pathname: "/club-check" }}>
        Check price
      </Button>
    ],
    state: updatedState
  };
});

export const GET = handleRequest;
export const POST = handleRequest;