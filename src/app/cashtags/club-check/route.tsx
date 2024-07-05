/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { getAddressForFid } from "frames.js";
import { frames } from "../frames";
import { getCurrentPrice, getBalance, getPreviousTrade } from "@/app/services/moneyClubs";
import { lensClient } from "@/app/services/lens";
import { CASHTAG_BG_URL } from "@/app/services/utils";
import { ProfileInfo, PriceInfo, BalanceInfo } from "@/app/components/cashtags";

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
        <ProfileInfo image={moneyClub.image} handle={moneyClub.handle!}>
          {balance === BigInt(0) && <PriceInfo currentPrice={currentPrice as bigint} />}
          {balance !== BigInt(0) && (
            <>
              <PriceInfo currentPrice={currentPrice as bigint} prevPrice={prevTrade?.price as bigint} />
              <BalanceInfo balance={balance} leftSpace />
            </>
          )}
        </ProfileInfo>
      </div>
    ),
    buttons,
    state: updatedState,
    textInput: 'Buy / Sell amount'
  };
});

export const GET = handleRequest;
export const POST = handleRequest;