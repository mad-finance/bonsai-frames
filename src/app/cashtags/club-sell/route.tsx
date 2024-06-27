/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "../frames";
import { getSellPriceAfterFees, getBalance, DECIMALS } from "@/app/services/moneyClubs";
import { formatEther, parseUnits } from "viem";
import { roundedToFixed, CASHTAG_BG_URL } from "@/app/services/utils";

const handleRequest = frames(async (ctx) => {
  const { moneyClubAddress, walletAddress, moneyClub } = ctx.state;
  if (!ctx.message?.inputText || isNaN(Number(ctx.message.inputText)))
    throw new Error("Invalid input: inputText should be a number");

  const [calculatedSellPrice, balance] = await Promise.all([
    getSellPriceAfterFees(moneyClubAddress as `0x${string}`, ctx.message?.inputText),
    getBalance(moneyClubAddress as `0x${string}`, walletAddress as `0x${string}`),
  ]);

  if (BigInt(balance.toString()) < parseUnits(ctx.message.inputText, DECIMALS)) {
    throw new Error("Invalid input: insufficient balance");
  }

  const buttons: any[] = [];

  buttons.push(
    <Button action="post" target={{ pathname: "/club-check" }}>
      ⬅️ Back
    </Button>
  );

  buttons.push(
    <Button action="tx" target="/club-sell-tx" post_url="/club-sell-status">
      Sell
    </Button>
  );

  const updatedState = {
    ...ctx.state,
    currentPrice: calculatedSellPrice.toString(),
    sellAmount: parseUnits(ctx.message?.inputText, DECIMALS).toString()
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
            <div tw="bg-black text-white font-bold rounded-xl py-4 px-6 mt-6 text-14 mr-6">{`Selling ${ctx.message?.inputText} =>`}</div>
            <div tw="bg-black text-white font-bold rounded-xl py-4 px-6 mt-6 text-14">{`${roundedToFixed(parseFloat(formatEther(calculatedSellPrice as bigint)), 2)} $BONSAI`}</div>
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