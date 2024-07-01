import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client";
import { polygon } from "viem/chains";
import { createPublicClient, http, parseUnits, erc20Abi, formatEther } from "viem";
import MadMoneyClubsAbi from "./abi/MadMoneyClubs.json";
import { BONSAI_TOKEN_ADDRESS, roundedToFixed } from "./utils";

const REGISTERED_CLUB = gql`
  query Club($id: Bytes!) {
    club(id: $id) {
      id
      initialSupply
      createdAt
      supply
      feesEarned
      currentPrice
    }
  }
`;

const PREVIOUS_TRADE = gql`
  query PreviousTrade($id: Bytes!, $startOfDayUTC: Int!) {
    trades(where:{club: $id, createdAt_gt: $startOfDayUTC}, orderBy: createdAt, orderDirection: asc, first: 1) {
      price
      createdAt
    }
  }
`;

export const INITIAL_CHIP_SUPPLY_CAP = 10; // with 6 decimals in the contract
export const DECIMALS = 6;
export const MONEY_CLUBS_SUBGRAPH_URL = `https://gateway-arbitrum.network.thegraph.com/api/${process.env.MONEY_CLUBS_SUBGRAPH_API_KEY}/subgraphs/id/ECHELoGXmU3uscig75SygTqkUhB414jNAHifd4WtpRoa`;
export const MONEY_CLUBS_CONTRACT_ADDRESS = "0x1463e62f704dd82efbb9df4822da7d19a8144ed1";

const subgraphClient = () => {
  return new ApolloClient({
    ssrMode: typeof window === "undefined", // set to true for server-side rendering
    link: new HttpLink({ uri: MONEY_CLUBS_SUBGRAPH_URL }),
    cache: new InMemoryCache(),
  });
};

export const publicClient = createPublicClient({
  chain: polygon,
  transport: http(process.env.POLYGON_RPC_URL),
});

export const getRegisteredClub = async (id: `0x${string}`) => {
  const { data } = await subgraphClient().query({
    query: REGISTERED_CLUB,
    variables: { id: id.toLowerCase() }
  });

  return data.club;
};

export const getCurrentPrice = async (id: `0x${string}`, amount: string = '1'): Promise<BigInt> => {
  const price = publicClient.readContract({
    address: MONEY_CLUBS_CONTRACT_ADDRESS,
    abi: MadMoneyClubsAbi,
    functionName: "getBuyPrice",
    args: [id, parseUnits(amount, DECIMALS)],
  });

  return price as unknown as BigInt;
};

export const getBuyPriceAfterFees = async (id: `0x${string}`, amount: string): Promise<BigInt> => {
  const price = publicClient.readContract({
    address: MONEY_CLUBS_CONTRACT_ADDRESS,
    abi: MadMoneyClubsAbi,
    functionName: "getBuyPriceAfterFees",
    args: [id, parseUnits(amount, DECIMALS)],
  });

  return price as unknown as BigInt;
};

export const getSellPriceAfterFees = async (id: `0x${string}`, amount: string): Promise<BigInt> => {
  const price = publicClient.readContract({
    address: MONEY_CLUBS_CONTRACT_ADDRESS,
    abi: MadMoneyClubsAbi,
    functionName: "getSellPriceAfterFees",
    args: [id, parseUnits(amount, DECIMALS)],
  });

  return price as unknown as BigInt;
};

export const getBalance = async (id: `0x${string}`, account: `0x${string}`): Promise<BigInt> => {
  const balance = publicClient.readContract({
    address: MONEY_CLUBS_CONTRACT_ADDRESS,
    abi: MadMoneyClubsAbi,
    functionName: "balances",
    args: [id, account],
  });

  return balance as unknown as BigInt;
};

export const getAllowance = async (account: `0x${string}`): Promise<BigInt> => {
  const allowance = publicClient.readContract({
    address: BONSAI_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: [account, MONEY_CLUBS_CONTRACT_ADDRESS],
  });

  return allowance as unknown as BigInt;
};

export const getPreviousTrade = async (id: `0x${string}`) => {
  const now = new Date();
  const twentyFourHoursAgoUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours() - 24);
  const { data } = await subgraphClient().query({
    query: PREVIOUS_TRADE,
    variables: { id: id.toLowerCase(), startOfDayUTC: Math.floor(twentyFourHoursAgoUTC / 1000) }
  });

  return data.trades[0] || {};
};

export const calculatePriceDelta = (price: bigint, lastTradePrice: bigint): { valuePct: number; positive?: boolean } => {
  const priceDelta: bigint = price > lastTradePrice ? price - lastTradePrice : lastTradePrice - price;
  const priceDeltaPercentage = parseFloat(formatEther(priceDelta)) * 100 / parseFloat(formatEther(price));
  return {
    valuePct: parseFloat(roundedToFixed(priceDeltaPercentage, 2)),
    positive: price > lastTradePrice,
  };
};