import assert from 'assert'
import {Chain, ChainContext, EventContext, Event, Result, Option} from './support'

export class PhalaVaultOwnerSharesClaimedEvent {
    private readonly _chain: Chain
    private readonly event: Event

    constructor(ctx: EventContext)
    constructor(ctx: ChainContext, event: Event)
    constructor(ctx: EventContext, event?: Event) {
        event = event || ctx.event
        assert(event.name === 'PhalaVault.OwnerSharesClaimed')
        this._chain = ctx._chain
        this.event = event
    }

    /**
     * Owner shares is claimed by pool owner
     * Affected states:
     * - the shares related fields in [`Pools`]
     * - the nft related storages in rmrk and pallet unique
     */
    get isV1199(): boolean {
        return this._chain.getEventHash('PhalaVault.OwnerSharesClaimed') === '1a90b37fe35b57535681edf54bc9a7b3c018e99bc657c379f89e9e2e3f46780e'
    }

    /**
     * Owner shares is claimed by pool owner
     * Affected states:
     * - the shares related fields in [`Pools`]
     * - the nft related storages in rmrk and pallet unique
     */
    get asV1199(): {pid: bigint, user: Uint8Array, shares: bigint} {
        assert(this.isV1199)
        return this._chain.decodeEvent(this.event)
    }
}

export class PhalaVaultOwnerSharesGainedEvent {
    private readonly _chain: Chain
    private readonly event: Event

    constructor(ctx: EventContext)
    constructor(ctx: ChainContext, event: Event)
    constructor(ctx: EventContext, event?: Event) {
        event = event || ctx.event
        assert(event.name === 'PhalaVault.OwnerSharesGained')
        this._chain = ctx._chain
        this.event = event
    }

    /**
     * Additional owner shares are mint into the pool
     * 
     * Affected states:
     * - the shares related fields in [`Pools`]
     * - last_share_price_checkpoint in [`Pools`]
     */
    get isV1199(): boolean {
        return this._chain.getEventHash('PhalaVault.OwnerSharesGained') === '14cb52df4abdc85a77424c03cf93c532519aacf79ee53c7ec6d65b93df15cebf'
    }

    /**
     * Additional owner shares are mint into the pool
     * 
     * Affected states:
     * - the shares related fields in [`Pools`]
     * - last_share_price_checkpoint in [`Pools`]
     */
    get asV1199(): {pid: bigint, shares: bigint, checkoutPrice: bigint} {
        assert(this.isV1199)
        return this._chain.decodeEvent(this.event)
    }
}

export class PhalaVaultPoolCreatedEvent {
    private readonly _chain: Chain
    private readonly event: Event

    constructor(ctx: EventContext)
    constructor(ctx: ChainContext, event: Event)
    constructor(ctx: EventContext, event?: Event) {
        event = event || ctx.event
        assert(event.name === 'PhalaVault.PoolCreated')
        this._chain = ctx._chain
        this.event = event
    }

    /**
     * A vault is created by `owner`
     * 
     * Affected states:
     * - a new entry in [`Pools`] with the pid
     */
    get isV1199(): boolean {
        return this._chain.getEventHash('PhalaVault.PoolCreated') === '720a4e6563b16af792d1a1fbbaddf69e57bccbbacc67267e9bbf437a48598f92'
    }

    /**
     * A vault is created by `owner`
     * 
     * Affected states:
     * - a new entry in [`Pools`] with the pid
     */
    get asV1199(): {owner: Uint8Array, pid: bigint, cid: number, poolAccountId: Uint8Array} {
        assert(this.isV1199)
        return this._chain.decodeEvent(this.event)
    }
}

export class PhalaVaultVaultCommissionSetEvent {
    private readonly _chain: Chain
    private readonly event: Event

    constructor(ctx: EventContext)
    constructor(ctx: ChainContext, event: Event)
    constructor(ctx: EventContext, event?: Event) {
        event = event || ctx.event
        assert(event.name === 'PhalaVault.VaultCommissionSet')
        this._chain = ctx._chain
        this.event = event
    }

    /**
     * The commission of a vault is updated
     * 
     * The commission ratio is represented by an integer. The real value is
     * `commission / 1_000_000u32`.
     * 
     * Affected states:
     * - the `commission` field in [`Pools`] is updated
     */
    get isV1199(): boolean {
        return this._chain.getEventHash('PhalaVault.VaultCommissionSet') === 'f9fd566d432542f7d455c2c329ace5fed0f06ab260c0f1a71f38b55f59535a53'
    }

    /**
     * The commission of a vault is updated
     * 
     * The commission ratio is represented by an integer. The real value is
     * `commission / 1_000_000u32`.
     * 
     * Affected states:
     * - the `commission` field in [`Pools`] is updated
     */
    get asV1199(): {pid: bigint, commission: number} {
        assert(this.isV1199)
        return this._chain.decodeEvent(this.event)
    }
}
