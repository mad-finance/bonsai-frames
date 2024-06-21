import { LensClient, production, FrameVerifySignatureResult } from "@lens-protocol/client";

interface VerifyFrameSignatureProps {
  untrustedData: any;
  trustedData: any;
}

export const lensClient = new LensClient({ environment: production });

export const verifyFrameSignature = async ({ untrustedData, trustedData }: VerifyFrameSignatureProps): Promise<boolean> => {
  const response = await lensClient.frames.createFrameTypedData({ ...untrustedData });
  const verification = await lensClient.frames.verifyFrameSignature({
    identityToken: untrustedData.identityToken,
    signature: trustedData.messageBytes,
    signedTypedData: response,
  });

  return verification === FrameVerifySignatureResult.Verified;
};
