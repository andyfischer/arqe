
import Pattern from './Pattern'
import IDSource from './utils/IDSource'
import Tuple from './Tuple'
import Stream from './Stream'
import TableInterface, { GenericStream } from './TableInterface'

export default class Table implements TableInterface {
    name: string
    pattern: Pattern

    nextSlotId: IDSource = new IDSource();
    _slots = new Map<string, Tuple>();

    constructor(name: string, pattern: Pattern) {
        this.name = name;
        this.pattern = pattern;
    }

    scan(out: GenericStream<{slotId: string, tuple: Tuple}>) {
        for (const [slotId, tuple] of this._slots.entries())
            out.receive({slotId, tuple});

        out.finish();
    }

    insert(tuple: Tuple, out: Stream) {
        const slotId = this.nextSlotId.take();
        this._slots.set(slotId, tuple);
        out.done();
    }

    update(slotId: string, tuple: Tuple, out: Stream) {
        this._slots.set(slotId, tuple);
        out.done();
    }

    delete(slotId: string, out: Stream) {
        this._slots.delete(slotId);
        out.done();
    }
}
