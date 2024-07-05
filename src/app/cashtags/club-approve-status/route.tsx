/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "../frames";
import { getAllowance, publicClient } from "@/app/services/moneyClubs";
import { polygonScanUrl, CASHTAG_BG_URL } from "@/app/services/utils";
import { ProfileInfo, TransactionInfo } from "@/app/components/cashtags";

export const POST = frames(async (ctx) => {
  const currentState = ctx.state;
  const transactionId = ctx.message?.transactionId || currentState.transactionId;
  const { moneyClub, buyAmount, currentPrice } = currentState;

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
        <ProfileInfo image={moneyClub!.image!} handle={moneyClub!.handle!}>
          {
            txPending
              ? <div tw="flex justify-center text-white rounded-xl py-2 px-6 mt-4 text-16 bg-black">Transaction Pending...</div>
              : <TransactionInfo label="Buying" amount={buyAmount} calculatedPrice={currentPrice} />
          }
        </ProfileInfo>
      </div>
    ),
    buttons,
    state: updatedState
  };
});