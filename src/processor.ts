import {lookupArchive} from '@subsquid/archive-registry'
import * as ss58 from "@subsquid/ss58"
import {Like, In} from "typeorm"
import {
    BatchContext,
    BatchProcessorCallItem,
    BatchProcessorEventItem,
    BatchProcessorItem,
    SubstrateBatchProcessor,
} from '@subsquid/substrate-processor'
import { TypeormDatabase} from "@subsquid/typeorm-store"
import { Owner, Vault, VaultAction } from './model';
import { PhalaVaultOwnerSharesClaimedEvent, PhalaVaultOwnerSharesGainedEvent, PhalaVaultVaultCommissionSetEvent, PhalaVaultPoolCreatedEvent} from './types/events';

interface VaultRecord {
    id: bigint
    owner: string
    //tvl: bigint
}
interface VaultActionRecord {
    id: string
    vault: bigint
    timestamp: string
    date: Date
    //tvl: bigint
    type: string
    content: string
}

interface VaultContributionRecord {
    id: string
    vault: bigint
    amount: bigint,
}

function getVault(m: Map<string, Vault>, id: string): Vault {
    let e = m.get(id)
    if (e == null) {
        e = new Vault()
        e.id = id
        //e.tvl=BigInt(0)
        m.set(id, e)
    }
    return e
}
function getOwner(m: Map<string, Owner>, id: string): Owner {
    let e = m.get(id)
    if (e == null) {
        e = new Owner()
        e.id = id
        m.set(id, e)
    }
    return e
}

export const processor = new SubstrateBatchProcessor()
    .setDataSource({
        archive: lookupArchive('khala', {release: 'FireSquid'}),
    })
    .addEvent("PhalaVault.VaultCommissionSet", {
        data: { event: { args: true , extrinsic: true, call: true} },
    } as const)
    .addEvent("PhalaVault.OwnerSharesGained", {
        data: { event: { args: true , extrinsic: true, call: true} },
    } as const)
    .addEvent("PhalaVault.OwnerSharesClaimed", {
        data: { event: { args: true , extrinsic: true, call: true} },
    } as const)
    .addEvent("PhalaVault.PoolCreated", {
        data: { event: { args: true , extrinsic: true, call: true} },
    } as const)
    /*
    .addEvent("PhalaVault.Contribution", {
        data: { event: { args: true , extrinsic: true, call: true} },
    } as const)
    .addEvent("PhalaBasePool.Withdrawal", {
        data: { event: { args: true , extrinsic: true, call: true} },
    } as const)
    */
    
const vaults: VaultRecord[] = [];
const vault_actions: VaultActionRecord[] = [];
const vault_contributions: VaultContributionRecord[] = [];

const database = new TypeormDatabase();
processor.run(database, async (ctx) => {
    for (const block of ctx.blocks) {
        for (const item of block.items) {
            if (item.name === 'PhalaVault.PoolCreated') {
                const e = new PhalaVaultPoolCreatedEvent(ctx,item.event);
                let rec:{owner: Uint8Array, pid: bigint};
                let {owner, pid} = e.asV1199;
                rec = {owner, pid}
                const vault = {
                    id: pid,
                    owner: ss58.codec("phala").encode(owner),
                    //tvl: BigInt(0)
                }
                vaults.push(vault);
            }
            if (item.name === 'PhalaVault.VaultCommissionSet') {
                const e = new PhalaVaultVaultCommissionSetEvent(ctx,item.event);
                let rec:{pid: bigint, commission: number};
                let {pid, commission} = e.asV1199;
                rec = {pid,commission}
                const action = {
                    id: item.event.id,
                    vault: pid,
                    //tvl: BigInt(0),
                    timestamp: String(block.header.timestamp),
                    date: new Date(block.header.timestamp),
                    type: "commissionSet",
                    content: String(commission)
                }
                vault_actions.push(action);
            }
            if (item.name === 'PhalaVault.OwnerSharesGained') {
                const e = new PhalaVaultOwnerSharesGainedEvent(ctx,item.event);
                let rec:{pid: bigint, shares: bigint, checkoutPrice: bigint};
                let {pid, shares, checkoutPrice} = e.asV1199;
                rec = {pid, shares, checkoutPrice}
                const action = {
                    id: item.event.id,
                    vault: pid,
                    //tvl: BigInt(0),
                    timestamp: String(block.header.timestamp),
                    date: new Date(block.header.timestamp),
                    type: "ownerSharesGained",
                    content: String("{shares:"+shares+", checkoutPrice:"+checkoutPrice+"}")
                }
                vault_actions.push(action);
            }
            if (item.name === 'PhalaVault.OwnerSharesClaimed') {
                const e = new PhalaVaultOwnerSharesClaimedEvent(ctx,item.event);
                let rec:{pid: bigint, user: Uint8Array, shares: bigint};
                let {pid, user, shares} = e.asV1199;
                rec = {pid, user, shares}
                const action = {
                    id: item.event.id,
                    vault: pid,
                    //tvl: BigInt(0),
                    timestamp: String(block.header.timestamp),
                    date: new Date(block.header.timestamp),
                    type: "ownerSharesClaimed",
                    content: String("{shares:"+shares+", user:"+ss58.codec("phala").encode(user)+"}")
                }
                vault_actions.push(action);
            }
            /*
            if (item.name === 'PhalaVault.Contribution') {
                const e = new PhalaVaultContributionEvent(ctx,item.event);
                let rec:{pid: bigint, amount: bigint};
                let {pid, amount} = e.asV1199;
                rec = {pid, amount}
                const contribution = {
                    id: item.event.id,
                    vault: pid,
                    amount: amount,
                }
                vault_contributions.push(contribution);
            }
            if (item.name === 'PhalaBasePool.Withdrawal') {
                const e = new PhalaBasePoolWithdrawalEvent(ctx,item.event);
                let rec:{pid: bigint, amount: bigint};
                let {pid, amount} = e.asV1199;
                rec = {pid, amount}
                const contribution = {
                    id: item.event.id,
                    vault: pid,
                    amount: -amount,
                }
                vault_contributions.push(contribution);
            }*/
        }
    } /* batch done */

    /*******************
     * persist objects 
     *******************/

    /**
     * Vault and Owner Objects
     * */ 

    // We need all owners from the vaults
    // then we can create Owner on the fly in getOwner
    let owners_ids = new Set<string>();
    for (let v of vaults) {
        owners_ids.add(v.owner)
    }
    let store_owners = await ctx.store.findBy(Owner, {id: In([...owners_ids])}).then(e => {
        return new Map(e.map(el => [el.id, el]))
    })
    for (let v of vaults) {
        const s_v = new Vault();
        s_v.id = String(v.id);
        s_v.owner = getOwner(store_owners,v.owner)
        //s_v.tvl = v.tvl;
        await ctx.store.save(s_v.owner)
        await ctx.store.save(s_v)
    }
    
    /*
    let all_pool_ids = new Set<String>();

    let pool_contrib_ids = new Set<String>();
    for (let vc of vault_contributions) {
        pool_contrib_ids.add(String(vc.vault))
        all_pool_ids.add(String(vc.vault))
    }
    let store_contrib_vaults = await ctx.store.findBy(Vault, {id: In([...pool_contrib_ids])}).then(e => {
        return new Map(e.map(el => [String(el.id), el]))
    })
    for (let vc of vault_contributions) {
        const s_v = getVault(store_contrib_vaults,vc.id)
        s_v.tvl = BigInt(s_v.tvl)+BigInt(vc.amount);
        await ctx.store.save(s_v)
    }
    */

    /**
     * VaultAction Objects
     */

    // we need all vault ids from the actions
    // then we can lookup the existing vaults in getVault
    let pool_ids = new Set<String>();
    for (let va of vault_actions) {
        pool_ids.add(String(va.vault))
        //all_pool_ids.add(String(va.vault))
    }
    let store_vaults = await ctx.store.findBy(Vault, {id: In([...pool_ids])}).then(e => {
        return new Map(e.map(el => [String(el.id), el]))
    })
    for (let va of vault_actions) {
        const s_va = new VaultAction();
        s_va.id = va.id;
        s_va.vault = getVault(store_vaults,String(va.vault));
        //s_va.tvl = s_va.vault.tvl;
        s_va.type = va.type;
        s_va.timestamp = va.timestamp;
        s_va.date = va.date;
        s_va.content = va.content;
        await ctx.store.save(s_va);
    }

});

/*
export type Item = BatchProcessorItem<typeof processor>
export type EventItem = BatchProcessorEventItem<typeof processor>
export type CallItem = BatchProcessorCallItem<typeof processor>
export type ProcessorContext<Store> = BatchContext<Store, Item>
*/
