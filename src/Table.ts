
import Pattern from './Pattern'
import IDSource from './utils/IDSource'
import Tuple from './Tuple'
import TableInterface from './TableInterface'

export default class Table {
    name: string
    pattern: Pattern

    nextSlotId: IDSource = new IDSource();
    _slots = new Map<string, Tuple>();

    constructor(name: string, pattern: Pattern) {
        this.name = name;
        this.pattern = pattern;
    }

    *scanSlots() {
        for (const [slotId, tuple] of this._slots.entries())
            yield { slotId, tuple }
    }

    set(slotId: string, tuple: Tuple) {
        this._slots.set(slotId, tuple);
    }

    delete(slotId: string) {
        this._slots.delete(slotId);
    }
}
