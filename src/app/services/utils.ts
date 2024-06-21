export const BONSAI_TOKEN_ADDRESS = "0x3d2bd0e15829aa5c362a4144fdf4a1112fa29b5c";

export const roundedToFixed = (input: number, digits = 4): string => {
  const rounder = Math.pow(10, digits);
  return (Math.round(input * rounder) / rounder).toFixed(digits);
};

export function polygonScanUrl(id: `0x${string}`, route?: string) {
  return `https://polygonscan.com/${route || 'tx'}/${id}`;
};