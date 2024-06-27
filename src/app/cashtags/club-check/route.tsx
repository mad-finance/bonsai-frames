/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { getAddressForFid } from "frames.js";
import { frames } from "../frames";
import { getCurrentPrice, getBalance, DECIMALS, getPreviousTrade, calculatePriceDelta } from "@/app/services/moneyClubs";
import { lensClient } from "@/app/services/lens";
import { formatEther, formatUnits } from "viem";
import { roundedToFixed, CASHTAG_BG_URL } from "@/app/services/utils";

const handleRequest = frames(async (ctx) => {
  const { moneyClubProfileId } = ctx.searchParams;
  const moneyClubAddress = ctx.searchParams.moneyClubAddress || ctx.state.moneyClubAddress;

  let walletAddress: string | undefined = ctx.message?.connectedAddress || ctx.state.walletAddress;
  if (!walletAddress && ctx.message?.profileId) { // lens payload
    const owner = await lensClient.profile.fetch({ forProfileId: ctx.message?.profileId });
    walletAddress = owner?.ownedBy.address;
  } else if (!walletAddress && ctx.message?.requesterFid) {
    walletAddress = await getAddressForFid({
      fid: ctx.message?.requesterFid,
      options: { fallbackToCustodyAddress: true }
    });
  }

  const [currentPrice, balance, moneyClub, prevTrade] = await Promise.all([
    getCurrentPrice(moneyClubAddress as `0x${string}`),
    getBalance(moneyClubAddress as `0x${string}`, walletAddress as `0x${string}`),
    (async () => {
      if (!!ctx.state.moneyClub) return ctx.state.moneyClub;
      const profile = await lensClient.profile.fetch({ forProfileId: moneyClubProfileId });
      return { image: profile?.metadata?.picture?.optimized?.uri, handle: profile?.handle?.localName };
    })(),
    getPreviousTrade(moneyClubAddress as `0x${string}`)
  ]);

  const buttons: any[] = [];

  if (balance !== BigInt(0)) {
    buttons.push(
      <Button action="post" target="/club-sell">
        Sell
      </Button>
    );
  }

  buttons.push(
    <Button action="post" target="/club-calculate-price">
      Buy
    </Button>
  );

  const updatedState = {
    walletAddress,
    moneyClubAddress,
    moneyClubProfileId,
    moneyClub,
    currentPrice: currentPrice.toString()
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
          <div tw="flex justify-center items-center text-black mt-4 text-20" style={{ fontWeight: 1000 }}>
            ${moneyClub?.handle}
          </div>
          {balance === BigInt(0) && (
            <div tw="flex justify-center items-center bg-black text-white font-bold rounded-xl py-4 px-6 mt-6 text-14">
              {`${roundedToFixed(parseFloat(formatEther(currentPrice as bigint)), 2)} $BONSAI`}
            </div>
          )}
          {balance !== BigInt(0) && (
            <div tw="flex flex-col">
              <div tw="flex justify-center items-center bg-black text-white font-bold rounded-xl py-2 px-4 mt-4 text-12">
                {`${roundedToFixed(parseFloat(formatEther(currentPrice as bigint)), 2)} $BONSAI`}
                {prevTrade?.price && (
                  <span tw={BigInt(prevTrade.price) < BigInt(currentPrice.toString()) ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                    {`${BigInt(prevTrade.price) < BigInt(currentPrice.toString()) ? '+' : '-'}${calculatePriceDelta(BigInt(currentPrice.toString()), BigInt(prevTrade.price))}%`}
                  </span>
                )}
              </div>
              <div tw="flex justify-center items-center bg-black text-white font-bold rounded-xl py-2 px-2 mt-4 text-12">
                {`Balance: ${roundedToFixed(parseFloat(formatUnits(balance as bigint, DECIMALS)), 2)}`}
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    buttons,
    state: updatedState,
    textInput: 'Buy / Sell amount'
  };
});

export const GET = handleRequest;
export const POST = handleRequest;