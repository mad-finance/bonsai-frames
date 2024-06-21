/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "../frames";
import { getCurrentPrice, getAllowance, publicClient } from "@/app/services/moneyClubs";
import { formatEther } from "viem";
import { roundedToFixed, polygonScanUrl } from "@/app/services/utils";

export const POST = frames(async (ctx) => {
  const { moneyClubAddress } = ctx.state;
  const currentState = ctx.state;
  const transactionId = ctx.message?.transactionId || currentState.transactionId;

  const [currentPrice, allowance, transaction] = await Promise.all([
    getCurrentPrice(moneyClubAddress as `0x${string}`),
    getAllowance(currentState.walletAddress as `0x${string}`),
    (async () => {
      if (!!transactionId) {
        return await publicClient.getTransaction({ hash: transactionId! as `0x${string}` });
      }
    })()
  ]);

  const buttons: any[] = [];
  if (transactionId) {
    buttons.push(
      <Button action="link" target={polygonScanUrl(transactionId! as `0x${string}`)}>
        View on block explorer
      </Button>
    );
  }

  const txPending = !transaction?.blockHash || allowance === BigInt(0);
  if (txPending) {
    buttons.push(
      <Button action="post" target={{ pathname: "/club-approve-status" }}>
        Refresh
      </Button>
    );
  } else {
    buttons.push(
      <Button action="tx" target="/club-buy-tx" post_url="/club-buy-status">
        Buy
      </Button>
    );
  }

  const updatedState = { ...currentState, currentPrice: currentPrice.toString(), transactionId };

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
          {
            txPending
              ? 'Transaction Pending...'
              : (
                <>
                  Current Price: {`${roundedToFixed(parseFloat(formatEther(currentPrice as bigint)), 0)}`}
                  <span tw="ml-2 text-green-400">$BONSAI</span>
                </>
              )
          }
        </div>
      </div>
    ),
    buttons,
    state: updatedState
  };
});