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

export const getHandleById = async (forProfileId) => {
  const profile = await lensClient.profile.fetch({ forProfileId })
  return profile?.handle?.localName
}

export const getSharedTable = async (forId: string) => {
  const publication = await lensClient.publication.fetch({ forId })
  if (publication) {
    const content = publication.metadata?.content
    if (content) {
      const match = content.match(/https?:\/\/frames\.bonsai\.meme[^\s)]+/)
      if (match) {
        const url = match[0]
        const urlParams = new URLSearchParams(new URL(url).search)
        return urlParams.get("table")?.slice(0, 66) // returns parsed table id param or null
      }
      return null
    }
    return null
  }
  return null
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
