import { LensClient, production, FrameVerifySignatureResult } from "@lens-protocol/client"

interface VerifyFrameSignatureProps {
  untrustedData: any
  trustedData: any
}

export const lensClient = new LensClient({ environment: production })

export const getProfileById = async (forProfileId) => {
  const profile = await lensClient.profile.fetch({ forProfileId })
  return profile
}

export const verifyFrameSignature = async ({
  untrustedData,
  trustedData,
}: VerifyFrameSignatureProps): Promise<boolean> => {
  const {
    url,
    inputText,
    state,
    buttonIndex,
    actionResponse,
    profileId,
    pubId,
    specVersion,
    deadline,
    identityToken,
  } = untrustedData
  const typedData = await lensClient.frames.createFrameTypedData({
    url,
    inputText,
    state,
    buttonIndex,
    actionResponse,
    profileId,
    pubId,
    specVersion,
    deadline,
  })
  const verification = await lensClient.frames.verifyFrameSignature({
    identityToken: untrustedData.identityToken,
    signature: trustedData.messageBytes,
    signedTypedData: typedData,
  })

  return verification === FrameVerifySignatureResult.Verified
}
