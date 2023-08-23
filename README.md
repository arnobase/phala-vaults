# Indexer for Phala vaults

keep track of commissions change, and vault owner shares claims

the purpose of this squid is to help find malicious actions from vault owners (unexpected commission raise before claiming)

see details in [INIT.md](./INIT.md)

### currently deployed on susbquid, for khala

[https://squid.subsquid.io/phala-vaults/v/v1/graphql](https://squid.subsquid.io/phala-vaults/v/v1/graphql)

### simple query

to get all actions from a specific vault

```
query MyQuery {
  vaultActions(where: {vault: {id_eq: "3618"}}, orderBy: date_DESC) {
    id
    type
    date
    content
  }
}
```
