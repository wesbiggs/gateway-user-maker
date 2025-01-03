import { mnemonicGenerate } from "@polkadot/util-crypto";
import { UserMaker } from "./index.js";

// Initialize with gateway URL
const userMaker = new UserMaker("http://localhost:3013");

// Create a random key pair
const mnemonic = mnemonicGenerate();

// Store this recovery phrase somewhere safe!
console.log({ mnemonic });

const handleBase = "changeme";
const delegations = [15]; // 15 = dsnp.profile-resources@v1

userMaker.makeUser(mnemonic, handleBase, delegations).then((result) => {
  // Result will contain the new MSA and handle
  console.log({ result });
  process.exit();
});
