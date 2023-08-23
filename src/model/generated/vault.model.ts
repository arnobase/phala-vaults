import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, OneToMany as OneToMany_} from "typeorm"
import {Owner} from "./owner.model"
import {VaultAction} from "./vaultAction.model"

@Entity_()
export class Vault {
    constructor(props?: Partial<Vault>) {
        Object.assign(this, props)
    }

    /**
     * Vault number
     */
    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => Owner, {nullable: true})
    owner!: Owner

    @OneToMany_(() => VaultAction, e => e.vault)
    actions!: VaultAction[]
}
