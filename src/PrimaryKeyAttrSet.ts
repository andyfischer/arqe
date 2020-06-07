
import Table from './Table'

export default class PrimaryKeyAttrSet {
    attrs: string[]
    table: Table

    constructor(attrs: string[], table: Table) {
        this.attrs = attrs;
        this.table = table;
    }
}
