/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { getAddressForFid } from "frames.js";
import { frames } from "../frames";
import { getCurrentPrice, getAllowance, getBalance } from "@/app/services/moneyClubs";
import { lensClient } from "@/app/services/lens";
import { formatEther } from "viem";
import { roundedToFixed, CASHTAG_BG_URL } from "@/app/services/utils";

const handleRequest = frames(async (ctx) => {
  const { moneyClubAddress, moneyClub } = ctx.state;
  const currentState = ctx.state;

  console.log('ctx.state', ctx.state);

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

  // TODO: get club info with this wallet's latest trade. calculate delta and show in the card
  const [currentPrice, allowance, balance] = await Promise.all([
    getCurrentPrice(moneyClubAddress as `0x${string}`),
    getAllowance(walletAddress as `0x${string}`),
    getBalance(moneyClubAddress as `0x${string}`, walletAddress as `0x${string}`)
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

  const updatedState = { ...currentState, walletAddress, currentPrice: currentPrice.toString() };

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
          <div tw="flex justify-center items-center text-black mt-12 text-20" style={{ fontWeight: 1000 }}>
            ${moneyClub?.handle}
          </div>
          <div tw="flex justify-center items-center bg-black text-white font-bold rounded-xl py-4 px-5 mt-10 text-16">
            Current Price: {`${roundedToFixed(parseFloat(formatEther(currentPrice as bigint)), 0)}`}
            <span tw="ml-2 text-green-400">$BONSAI</span>
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