/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "../frames";
import { getBuyPriceAfterFees, getAllowance, DECIMALS } from "@/app/services/moneyClubs";
import { parseUnits } from "viem";
import { CASHTAG_BG_URL } from "@/app/services/utils";
import { ProfileInfo, TransactionInfo } from "@/app/components/cashtags";

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
        <ProfileInfo image={moneyClub!.image!} handle={moneyClub!.handle!}>
          <TransactionInfo label="Buying" amount={ctx.message?.inputText} calculatedPrice={calculatedPrice as bigint} />
        </ProfileInfo>
      </div>
    ),
    buttons,
    state: updatedState
  };
});

export const GET = handleRequest;
export const POST = handleRequest;