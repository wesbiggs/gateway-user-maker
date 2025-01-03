# Gateway User Maker

This is a small library to aid in programmatic creation of Frequency user accounts via Frequency Developer Gateway.

## API

The only configuration needed is the URL of your Gateway instance.

```
const userMaker = new UserMaker(gatewayUrl);
const result = await userMaker.makeUser(mnemonic, handleBase, delegations);
```

Where `mnemonic` is a BIP39 seed phrase, `handleBase` is a Frequency handle base, and `delegations` is an array of Frequency schema identifiers (numbers).

The process will generate output like:

```
  result: {
    msaId: '12584',
    handle: { base_handle: 'xyz', canonical_base: 'xyz', suffix: 87 }
  }
```

Be sure to save your BIP39 seed phrase securely.

## Example

See `example.ts` for example usage.
