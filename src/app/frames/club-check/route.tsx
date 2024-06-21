/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { getAddressForFid } from "frames.js";
import { frames } from "../frames";
import { getCurrentPrice, getAllowance, getBalance } from "@/app/services/moneyClubs";
import { lensClient } from "@/app/services/lens";
import { formatEther } from "viem";
import { roundedToFixed } from "@/app/services/utils";

const handleRequest = frames(async (ctx) => {
  const { moneyClubAddress, moneyClubProfileId } = ctx.state;
  const currentState = ctx.state;

  if (ctx.message?.transactionId) {
    console.log(`ctx.message?.transactionId: ${ctx.message?.transactionId}`);
  }

  let walletAddress: string | undefined = ctx.message?.connectedAddress;
  if (!walletAddress && ctx.message?.profileId) { // lens payload
    const owner = await lensClient.profile.fetch({ forProfileId: ctx.message?.profileId });
    walletAddress = owner?.ownedBy.address;
  } else if (!walletAddress && ctx.message?.requesterFid) {
    walletAddress = await getAddressForFid({
      fid: ctx.message?.requesterFid,
      options: { fallbackToCustodyAddress: true }
    });
  }

  const [currentPrice, allowance, balance, profile] = await Promise.all([
    getCurrentPrice(moneyClubAddress as `0x${string}`),
    getAllowance(walletAddress as `0x${string}`),
    getBalance(moneyClubAddress as `0x${string}`, walletAddress as `0x${string}`),
    lensClient.profile.fetch({ forProfileId: moneyClubProfileId })
  ]);

  const buttons: any[] = [];

  if (balance !== BigInt(0)) {
    buttons.push(
      <Button action="tx" target="/club-sell-tx" post_url="/club-sell-status">
        Sell
      </Button>
    );
  }
  // TODO: debugging
  if (true || allowance === BigInt(0)) {
    buttons.push(
      <Button action="tx" target="/club-approve-tx" post_url="/club-approve-status">
        Approve $BONSAI
      </Button>
    );
  } else {
    buttons.push(
      <Button action="tx" target="/club-buy-tx" post_url="/club-buy-status">
        Buy
      </Button>
    );
  }

  const moneyClub = { image: profile?.metadata?.picture?.optimized?.uri, handle: profile?.handle?.localName };
  const updatedState = { ...currentState, walletAddress, currentPrice: currentPrice.toString(), moneyClub };

  return {
    image: (
      <div tw="flex flex-col items-center justify-center">
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
        <div tw="flex justify-center items-center bg-gray-800 text-white font-bold rounded-xl py-3 px-4 mt-10 text-5xl">
          Current Price: {`${roundedToFixed(parseFloat(formatEther(currentPrice as bigint)), 0)}`}
          <span tw="ml-2 text-green-400">$BONSAI</span>
        </div>
      </div>
    ),
    buttons,
    state: updatedState
  };
});

export const GET = handleRequest;
export const POST = handleRequest;