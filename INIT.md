
### Create project from template

```sh
sqd init phala-vaults --template substrate
cd phala-vaults
```

### install dependencies

```bash
npm ci
```

### edit [schema.graphql](./schema.graphql)

- create entities
  - Vault
  - Owner
  - VaultAction

- Generate entities

```bash
sqd codegen
```

➡️ entities are generated into 📁 `src/model/generated`

### edit [typegen.json](./typegen.json)

- subscribe to events
  - PhalaVault.VaultCommissionSet
  - PhalaVault.OwnerSharesGained
  - PhalaVault.OwnerSharesClaimed

- Generate Events

```bash
sqd typegen
```

➡️ types are generated into 📁 `src/types`

### edit [processor.ts](./processor.ts)

import types and events

```ts
[...]
import { Owner, Vault, VaultAction } from './model';
import { PhalaVaultOwnerSharesClaimedEvent, PhalaVaultOwnerSharesGainedEvent, PhalaVaultVaultCommissionSetEvent } from './types/events';
[...]
```

change archive datasource to use "khala"

```ts
export const processor = new SubstrateBatchProcessor()
    .setDataSource({
        archive: lookupArchive('khala', {release: 'FireSquid'}),
    })
```

add events (clean the unused)

```ts
.addEvent("PhalaVault.VaultCommissionSet", {
    data: { event: { args: true , extrinsic: true, call: true} },
  } as const)
.addEvent("PhalaVault.OwnerSharesGained", {
    data: { event: { args: true , extrinsic: true, call: true} },
  } as const)
.addEvent("PhalaVault.OwnerSharesClaimed", {
    data: { event: { args: true , extrinsic: true, call: true} },
  } as const)
```

### Remove main.ts

I removed main.ts and put everything in processor.ts, thus I need to change call to main.ts in two files

`commands.json` and `squid.yml` --> change `lib/main `to `lib/processor`

### Do other stuff

continue to edit processor.ts

add processor.run

```ts
processor.run(database, async (ctx) => {
    for (const block of ctx.blocks) {
        for (const item of block.items) {
            if (item.name === 'PhalaVault.VaultCommissionSet') {
                const e = new PhalaVaultVaultCommissionSetEvent(ctx,item.event);
                let rec:{pid: bigint, commission: number};
                let {pid, commission} = e.asV1199;
                rec = {pid,commission}
                console.log("PhalaVaultVaultCommissionSetEvent",rec)
            }
        }
    }
});
```

....

### run processor

```ts
sqd codegen
sqd up
sqd process
```
