export const BONSAI_TOKEN_ADDRESS = "0x3d2bd0e15829aa5c362a4144fdf4a1112fa29b5c";
export const CASHTAG_BG_URL = "https://link.storjshare.io/raw/ju4evfg62cbcpxw3psgt4y4k523a/images/cashtag_frame_bg.png";
export const CASHTAG_PFP_OVERLAP_URL = "https://link.storjshare.io/raw/jvin5zqoliswwbp6xhohahr4wzoa/images/cashtag_pfp_overlap.png";
export const CASHTAG_DEX_URL = "https://dex.madfi.xyz";

export const roundedToFixed = (input: number, digits = 4): string => {
  const rounder = Math.pow(10, digits);
  const value = (Math.round(input * rounder) / rounder).toFixed(digits);
  return kFormatter(parseFloat(value));
};

export const kFormatter = (num): string => {
  if (typeof num === "string") return num;

  if (Math.abs(num) > 999_999) {
    return Math.sign(num) * (Math.abs(num) / 1_000_000).toFixed(1) + "mil";
  } else if (Math.abs(num) > 999) {
    return Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + "k";
  }

  return (Math.sign(num) * Math.abs(num)).toString();
};

export function polygonScanUrl(id: `0x${string}`, route?: string) {
  return `https://polygonscan.com/${route || 'tx'}/${id}`;
};