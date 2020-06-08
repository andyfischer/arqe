
import PrimaryKey from './PrimaryKey'
import Pattern from './Pattern'

export default class Table {
    name: string
    pattern: Pattern

    constructor(name: string, pattern: Pattern) {
        this.name = name;
        this.pattern = pattern;
    }
}
