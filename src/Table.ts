
import Pattern from './Pattern'
import IDSource from './utils/IDSource'
import Tuple from './Tuple'

export default class Table {
    name: string
    pattern: Pattern

    nextSlotId: IDSource = new IDSource();
    slots: { [ slotId: string]: Tuple } = {};

    constructor(name: string, pattern: Pattern) {
        this.name = name;
        this.pattern = pattern;
    }
}
