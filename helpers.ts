// Derived from https://github.com/ProjectLibertyLabs/siwf/blob/v1/packages/ui/src/lib/utils/index.ts
import "@frequency-chain/api-augment";
import { getApi } from "./connect.js";
import { ApiPromise } from "@polkadot/api";
import type { ISubmittableResult } from "@polkadot/types/types";
import { Bytes } from "@polkadot/types";
import { SubmittableExtrinsic } from "@polkadot/api/types";

export async function createClaimHandlePayload(
  expiration: number,
  handle: string,
): Promise<Uint8Array> {
  const api = await getApi();
  const handleBytes = new Bytes(api.registry, handle);
  return api.registry
    .createType("CommonPrimitivesHandlesClaimHandlePayload", {
      baseHandle: handleBytes,
      expiration,
    })
    .toU8a();
}

export async function createAddProviderPayload(
  expiration: number,
  providerId: string,
  schemaIds: number[],
): Promise<Uint8Array> {
  const api = await getApi();
  schemaIds.sort();
  return api.registry
    .createType("PalletMsaAddProvider", {
      authorizedMsaId: providerId,
      expiration,
      schemaIds,
    })
    .toU8a();
}

export async function getBlockNumber(apiPromise?: ApiPromise): Promise<number> {
  const api = apiPromise || (await getApi());
  return (await api.rpc.chain.getBlock()).block.header.number.toNumber();
}

export async function buildHandleTx(
  msaOwnerKey: string,
  proof: { Sr25519: string },
  payload: Uint8Array,
): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> {
  const api = await getApi();
  return api.tx.handles.claimHandle(msaOwnerKey, proof, payload);
}

export async function buildCreateSponsoredAccountTx(
  controlKey: string,
  proof: { Sr25519: string },
  payload: Uint8Array,
): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> {
  const api = await getApi();
  return api.tx.msa.createSponsoredAccountWithDelegation(
    controlKey,
    proof,
    payload,
  );
}
