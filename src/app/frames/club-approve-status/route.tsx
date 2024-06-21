/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "../frames";
import { getCurrentPrice, getAllowance } from "@/app/services/moneyClubs";
import { formatEther } from "viem";
import { roundedToFixed, polygonScanUrl } from "@/app/services/utils";

export const POST = frames(async (ctx) => {
  const { moneyClubAddress } = ctx.state;
  const currentState = ctx.state;

  const [currentPrice, allowance] = await Promise.all([
    getCurrentPrice(moneyClubAddress as `0x${string}`),
    getAllowance(currentState.walletAddress as `0x${string}`)
  ]);

  const buttons: any[] = [];

  if (ctx.message?.transactionId) {
    console.log(`ctx.message?.transactionId: ${ctx.message?.transactionId}`);
    buttons.push(
      <Button action="link" target={polygonScanUrl(ctx.message?.transactionId)}>
        View on block explorer
      </Button>
    );
  }

  if (allowance !== BigInt(0)) {
    buttons.push(
      <Button action="tx" target="/club-buy-tx" post_url="/club-buy-status">
        Buy
      </Button>
    );
  } else {
    buttons.push(
      <Button action="post_redirect" target="/club-buy-status">
        Refresh
      </Button>
    );
  }

  const updatedState = { ...currentState, currentPrice: currentPrice.toString() };

  return {
    image: (
      <div tw="flex flex-col items-center justify-center">
        <div tw="flex flex-col items-center">
          <span tw="flex h-48 w-48 overflow-hidden rounded-full border-8 border-gray-800">
            <img
              src={currentState.moneyClub?.image}
              tw="h-full w-full"
            />
          </span>
          <div tw="flex justify-center items-center bg-gray-800 text-white font-bold rounded-xl py-3 px-4 mt-10">
            ${currentState.moneyClub?.handle}
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