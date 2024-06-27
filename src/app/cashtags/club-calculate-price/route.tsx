/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "../frames";
import { getBuyPriceAfterFees, getAllowance, DECIMALS } from "@/app/services/moneyClubs";
import { formatEther, parseUnits } from "viem";
import { roundedToFixed, CASHTAG_BG_URL } from "@/app/services/utils";

const handleRequest = frames(async (ctx) => {
  const { moneyClubAddress, walletAddress, moneyClub, currentPrice } = ctx.state;
  if (!ctx.message?.inputText || isNaN(Number(ctx.message.inputText)))
    throw new Error("Invalid input: inputText should be a number");

  const [calculatedPrice, allowance] = await Promise.all([
    getBuyPriceAfterFees(moneyClubAddress as `0x${string}`, ctx.message?.inputText),
    getAllowance(walletAddress as `0x${string}`)
  ]);

  const buttons: any[] = [];

  buttons.push(
    <Button action="post" target={{ pathname: "/club-check" }}>
      ⬅️ Back
    </Button>
  );

  if (BigInt(allowance.toString()) < BigInt(currentPrice!)) {
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

  const updatedState = {
    ...ctx.state,
    currentPrice: calculatedPrice.toString(),
    buyAmount: parseUnits(ctx.message?.inputText, DECIMALS).toString()
  };

  return {
    image: (
      <div tw="flex w-full h-full items-center justify-center" style={{ backgroundImage: `url(${CASHTAG_BG_URL})`, backgroundSize: '100% 100%' }}>
        <div tw="flex flex-col items-center">
          <span tw="flex h-56 w-56 overflow-hidden rounded-full border-2 border-white">
            <img
              src={moneyClub?.image}
              tw="h-full w-full"
            />
          </span>
          <div tw="flex justify-center items-center text-black mt-8 text-20" style={{ fontWeight: 1000 }}>
            ${moneyClub?.handle}
          </div>
          <div tw="flex justify-center items-center">
            <div tw="bg-black text-white font-bold rounded-xl py-4 px-6 mt-6 text-14 mr-6">{`Buying ${ctx.message?.inputText} =>`}</div>
            <div tw="bg-black text-white font-bold rounded-xl py-4 px-6 mt-6 text-14">{`${roundedToFixed(parseFloat(formatEther(calculatedPrice as bigint)), 2)} $BONSAI`}</div>
          </div>
        </div>
      </div>
    ),
    buttons,
    state: updatedState
  };
});

export const GET = handleRequest;
export const POST = handleRequest;