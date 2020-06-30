
import Pattern from './Pattern'
import IDSource from './utils/IDSource'
import Tuple from './Tuple'
import Stream from './Stream'
import TableInterface, { TupleModifier } from './TableInterface'
import GenericStream, { StreamCombine } from './GenericStream'
import TupleModification from './TupleModification'

export default class Table implements TableInterface {
    name: string
    supportsCompleteScan = true
    pattern: Pattern

    nextSlotId: IDSource = new IDSource();
    _slots = new Map<string, Tuple>();

    constructor(name: string, pattern: Pattern) {
        this.name = name;
        this.pattern = pattern;
    }

    search(pattern: Tuple, out: Stream) {
        for (const [slotId, tuple] of this._slots.entries())
            if (pattern.isSupersetOf(tuple))
                out.next(tuple);

        out.done();
    }

    scan(out: GenericStream<{slotId: string, tuple: Tuple}>) {
        for (const [slotId, tuple] of this._slots.entries())
            out.receive({slotId, tuple});

        out.finish();
    }

    insert(insertTuple: Tuple, out: Stream) {
        // Check if it exists
        for (const [slotId, tuple] of this._slots.entries()) {
            if (insertTuple.isSupersetOf(tuple)) {
                // Already have this
                out.done();
                return;
            }
        }

        const slotId = this.nextSlotId.take();
        this._slots.set(slotId, insertTuple);
        out.done();
    }

    update(search: Tuple, modifier: TupleModifier, out: Stream) {
        for (const [slotId, tuple] of this._slots.entries()) {
            if (search.isSupersetOf(tuple)) {
                const modified = modifier(tuple);
                this._slots.set(slotId, modified);
                out.next(modified);
            }
        }
        out.done();
    }

    updatev2(search: Tuple, modifier: TupleModification, out: Stream) {
        for (const [slotId, tuple] of this._slots.entries()) {
            if (search.isSupersetOf(tuple)) {
                const modified = modifier.apply(tuple);
                this._slots.set(slotId, modified);
                out.next(modified);
            }
        }
        out.done();
    }

    delete(search: Tuple, out: Stream) {
        for (const [slotId, tuple] of this._slots.entries()) {
            if (search.isSupersetOf(tuple)) {
                this._slots.delete(slotId);
                out.next(tuple);
            }
        }
        out.done();
    }
}
