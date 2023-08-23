import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {Vault} from "./vault.model"

@Entity_()
export class VaultAction {
    constructor(props?: Partial<VaultAction>) {
        Object.assign(this, props)
    }

    /**
     * Extrinsic hash
     */
    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => Vault, {nullable: true})
    vault!: Vault

    @Column_("text", {nullable: false})
    timestamp!: string

    @Column_("timestamp with time zone", {nullable: false})
    date!: Date

    @Column_("text", {nullable: false})
    type!: string

    @Column_("text", {nullable: false})
    content!: string
}
