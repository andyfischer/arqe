
import Pattern from './Pattern'
import IDSource from './utils/IDSource'
import Tuple from './Tuple'
import TupleReceiver from './TupleReceiver'
import TableInterface, { Stream } from './TableInterface'

export default class Table implements TableInterface {
    name: string
    pattern: Pattern

    nextSlotId: IDSource = new IDSource();
    _slots = new Map<string, Tuple>();

    constructor(name: string, pattern: Pattern) {
        this.name = name;
        this.pattern = pattern;
    }

    scan(out: Stream<{slotId: string, tuple: Tuple}>) {
        for (const [slotId, tuple] of this._slots.entries())
            out.receive({slotId, tuple});

        out.finish();
    }

    set(slotId: string, tuple: Tuple, out: TupleReceiver) {
        this._slots.set(slotId, tuple);
        out.finish();
    }

    delete(slotId: string, out: TupleReceiver) {
        this._slots.delete(slotId);
        out.finish();
    }
}
