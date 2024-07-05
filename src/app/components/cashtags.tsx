import { ReactNode } from 'react';
import { formatEther, formatUnits } from "viem";
import { roundedToFixed } from "@/app/services/utils";
import { calculatePriceDelta, DECIMALS } from "@/app/services/moneyClubs";

interface ProfileInfoProps {
  image: string;
  handle: string;
  children?: ReactNode;
}

// TODO: pfp overlap
// TODO: bold font
export const ProfileInfo = ({ image, handle, children }: ProfileInfoProps) => {
  return (
    <div tw="flex flex-col items-center">
      <span tw="flex h-64 w-64 overflow-hidden rounded-full border-4 border-white">
        <img
          src={image}
          tw="h-full w-full"
        />
      </span>
      <div tw="flex justify-center items-center text-white mt-2 text-26" style={{ fontWeight: 400 }}>
        $<div tw="flex" style={{ fontWeight: 700 }}>{handle.toUpperCase()}</div>
      </div>
      {children}
    </div>
  )
}

interface PriceInfoProps {
  currentPrice: bigint;
  prevPrice?: bigint;
}

export const PriceInfo = ({ currentPrice, prevPrice }: PriceInfoProps) => {
  return (
    <div tw="flex justify-center text-white rounded-xl py-2 px-6 mt-4 text-16 bg-black">
      {/* NOTE: cannot wrap this number in a div or a span... */}
      {roundedToFixed(parseFloat(formatEther(currentPrice)), 2)}
      <span tw="text-10 ml-4 mt-6">$BONSAI</span>
      {prevPrice && (
        <span tw={`ml-6 rounded-xl px-2 ${BigInt(prevPrice) < BigInt(currentPrice.toString()) ? 'bg-green-700' : 'bg-red-700'}`}>
          {`${BigInt(prevPrice) < BigInt(currentPrice.toString()) ? '+' : '-'}${calculatePriceDelta(BigInt(currentPrice.toString()), BigInt(prevPrice))}%`}
        </span>
      )}
    </div>
  )
}

export const BalanceInfo = ({ balance, leftSpace }) => {
  return (
    <div tw={`flex justify-center text-white rounded-xl py-2 px-6 mt-4 text-16 bg-black ${leftSpace ? 'ml-6' : ''}`}>
      <span tw="text-10 mr-4 mt-6">BALANCE:</span>
      {roundedToFixed(parseFloat(formatUnits(balance as bigint, DECIMALS)), 2)}
    </div>
  )
}

export const TransactionInfo = ({ label, amount, calculatedPrice }) => {
  return (
    <div tw="flex justify-center items-center">
      <div tw="flex justify-center text-white rounded-xl py-2 px-6 mt-4 text-16 bg-black">
        <span tw="text-10 mr-4 mt-6">{label}:</span>
        {amount}
      </div>
      <div tw="flex justify-center text-white rounded-xl py-2 px-6 mt-4 text-16 bg-black ml-6">
        {roundedToFixed(parseFloat(formatEther(calculatedPrice as bigint)), 2)}
        <span tw="text-10 ml-4 mt-6">$BONSAI</span>
      </div>
    </div>
  )
}