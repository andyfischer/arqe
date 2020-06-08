
import Table from './Table'
import Pattern from './Pattern'

export default class PrimaryKey {
    pattern: Pattern
    table: Table

    constructor(pattern: Pattern, table: Table) {
        this.pattern = pattern;
        this.table = table;
    }
}
