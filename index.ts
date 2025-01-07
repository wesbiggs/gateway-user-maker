import { Keyring } from "@polkadot/keyring";
import { u8aWrapBytes, u8aToHex } from "@polkadot/util";
import fetch from "node-fetch";
import { setApiUrl } from "./connect.js";

import {
  buildCreateSponsoredAccountTx,
  buildHandleTx,
  createAddProviderPayload,
  createClaimHandlePayload,
  getBlockNumber,
} from "./helpers.js";

const POLL_INTERVAL_MS = 1_000;
const MAX_POLL_ATTEMPTS = 60;

/**
 * Helper class to create and submit the payloads needed for
 * new MSA creation to Frequency Developer Gateway.
 */
export class UserMaker {
  #gatewayUrl: string;
  #providerId: string | undefined;

  constructor(gatewayUrl: string) {
    this.#gatewayUrl = gatewayUrl;
  }

  async #loadConfig() {
    const response = await fetch(`${this.#gatewayUrl}/v1/accounts/siwf`);
    if (response.ok) {
      const result = await response.json();
      this.#providerId = result.providerId;
      setApiUrl(result.frequencyRpcUrl);
    } else {
      throw new Error("could not load config from gateway");
    }
  }

  async makeUser(mnemonic: string, baseHandle: string, schemaIds: number[]) {
    if (!this.#providerId) {
      await this.#loadConfig();
    }

    const blockNumber = await getBlockNumber();
    const expiration = blockNumber + 50;

    const keyring = new Keyring({ type: "sr25519" });
    const keyPair = keyring.addFromUri(mnemonic);

    const addProviderPayload = await createAddProviderPayload(
      expiration,
      this.#providerId!,
      schemaIds,
    );

    const addProviderSignature = keyPair.sign(u8aWrapBytes(addProviderPayload));

    const encodedAddProviderTx = await buildCreateSponsoredAccountTx(
      keyPair.address,
      { Sr25519: u8aToHex(addProviderSignature) },
      addProviderPayload,
    );

    const addProviderExtrinsic = {
      pallet: "msa",
      extrinsicName: "createSponsoredAccountWithDelegation",
      encodedExtrinsic: encodedAddProviderTx,
    };

    const claimHandlePayload = await createClaimHandlePayload(
      expiration,
      baseHandle,
    );

    const claimHandleSignature = keyPair.sign(u8aWrapBytes(claimHandlePayload));

    const encodedClaimHandleTx = await buildHandleTx(
      keyPair.address,
      { Sr25519: u8aToHex(claimHandleSignature) },
      claimHandlePayload,
    );

    const claimHandleExtrinsic = {
      pallet: "handles",
      extrinsicName: "claimHandle",
      encodedExtrinsic: encodedClaimHandleTx,
    };

    const response = await fetch(`${this.#gatewayUrl}/v1/accounts/siwf`, {
      method: "POST",
      body: JSON.stringify({
        signUp: {
          extrinsics: [addProviderExtrinsic, claimHandleExtrinsic],
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      // Poll for MSA
      let attempts = 0;
      do {
        const response = await fetch(
          `${this.#gatewayUrl}/v1/accounts/account/${keyPair.address}`,
        );
        if (response.ok) {
          const result = await response.json();
          return result;
        } else {
          await asyncTimeout(POLL_INTERVAL_MS);
        }
      } while (++attempts < MAX_POLL_ATTEMPTS);

      // Give up
      throw new Error(
        `Did not receive msaId after ${attempts} attempts, giving up`,
      );
    } else {
      console.log("Failure from gateway");
      console.log({ response });
      throw new Error("Failed when submitting to gateway");
    }
  }
}

// Simple timer function
const asyncTimeout = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
