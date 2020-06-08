
import PrimaryKey from './PrimaryKey'

export default class Table {
    name: string
    attrs: string[] = []

    possiblePrimaryKeys: PrimaryKey[] = []

    constructor(name: string) {
        this.name = name;
    }

    addAttr(name: string) {
        this.attrs.push(name);
    }
}
