
import PrimaryKeyAttrSet from './PrimaryKeyAttrSet'

export default class Table {
    name: string
    attrs: string[] = []

    possiblePrimaryKeyAttrSets: PrimaryKeyAttrSet[] = []

    constructor(name: string) {
        this.name = name;
    }

    addAttr(name: string) {
        this.attrs.push(name);
    }
}
