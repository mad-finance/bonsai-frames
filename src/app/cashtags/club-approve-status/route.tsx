/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "../frames";
import { getAllowance, publicClient, DECIMALS } from "@/app/services/moneyClubs";
import { formatEther, formatUnits } from "viem";
import { roundedToFixed, polygonScanUrl, CASHTAG_BG_URL } from "@/app/services/utils";

export const POST = frames(async (ctx) => {
  const currentState = ctx.state;
  const transactionId = ctx.message?.transactionId || currentState.transactionId;

  const [allowance, transaction] = await Promise.all([
    getAllowance(currentState.walletAddress as `0x${string}`),
    (async () => {
      if (!!transactionId) {
        return await publicClient.getTransaction({ hash: transactionId! as `0x${string}` });
      }
    })()
  ]);

  const buttons: any[] = [];
  const txPending = !transaction?.blockHash || allowance === BigInt(0);
  if (transactionId && txPending) {
    buttons.push(
      <Button action="link" target={polygonScanUrl(transactionId! as `0x${string}`)}>
        View on block explorer
      </Button>
    );
  }

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

  const updatedState = { ...currentState, transactionId };

  return {
    image: (
      <div tw="flex w-full h-full items-center justify-center" style={{ backgroundImage: `url(${CASHTAG_BG_URL})`, backgroundSize: '100% 100%' }}>
        <div tw="flex flex-col items-center">
          <span tw="flex h-56 w-56 overflow-hidden rounded-full border-2 border-white">
            <img
              src={currentState.moneyClub?.image}
              tw="h-full w-full"
            />
          </span>
          <div tw="flex justify-center items-center text-black mt-12 text-20" style={{ fontWeight: 1000 }}>
            ${currentState.moneyClub?.handle}
          </div>
          {
            txPending
              ? <div tw="flex justify-center items-center bg-gray-800 text-white font-bold rounded-xl py-3 px-4 mt-10 text-5xl">'Transaction Pending...'</div>
              : (
                <div tw="flex justify-center items-center">
                  <div tw="bg-black text-white font-bold rounded-xl py-4 px-6 mt-6 text-14 mr-6">{`Buying ${formatUnits(BigInt(currentState.buyAmount!), DECIMALS)} =>`}</div>
                  <div tw="bg-black text-white font-bold rounded-xl py-4 px-6 mt-6 text-14">{`${roundedToFixed(parseFloat(formatEther(BigInt(currentState.currentPrice!))), 2)} $BONSAI`}</div>
                </div>
              )
          }
        </div>
      </div>
    ),
    buttons,
    state: updatedState
  };
});