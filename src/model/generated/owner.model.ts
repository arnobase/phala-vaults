import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToMany as OneToMany_} from "typeorm"
import {Vault} from "./vault.model"

@Entity_()
export class Owner {
    constructor(props?: Partial<Owner>) {
        Object.assign(this, props)
    }

    /**
     * Account address
     */
    @PrimaryColumn_()
    id!: string

    @OneToMany_(() => Vault, e => e.owner)
    vaults!: Vault[]
}
