
import Pattern from './Pattern'
import IDSource from './utils/IDSource'
import Tuple from './Tuple'
import Stream from './Stream'
import TableInterface, { } from './TableInterface'
import GenericStream, { StreamCombine } from './GenericStream'
import TupleModification from './TupleModification'
import TableListener from './TableListener'

export default class Table implements TableInterface {
    name: string
    supportsCompleteScan = true
    pattern: Pattern

    nextSlotId: IDSource = new IDSource();
    slots = new Map<string, Tuple>();

    listeners = new Map<string, TableListener>();

    constructor(name: string, pattern: Pattern) {
        this.name = name;
        this.pattern = pattern;
    }

    select(pattern: Tuple, out: Stream) {
        for (const [slotId, tuple] of this.slots.entries())
            if (pattern.isSupersetOf(tuple))
                out.next(tuple);

        out.done();
    }

    scan(out: GenericStream<{slotId: string, tuple: Tuple}>) {
        for (const [slotId, tuple] of this.slots.entries())
            out.receive({slotId, tuple});

        out.finish();
    }

    insert(insertTuple: Tuple, out: Stream) {
        // Check if it exists
        for (const [slotId, tuple] of this.slots.entries()) {
            if (insertTuple.isSupersetOf(tuple)) {
                // Already have this
                out.done();
                return;
            }
        }

        const slotId = this.nextSlotId.take();
        this.slots.set(slotId, insertTuple);

        for (const listener of this.listeners.values()) {
            listener.insert(insertTuple);
        }

        out.done();
    }

    update(search: Tuple, modifier: TupleModification, out: Stream) {
        for (const [slotId, tuple] of this.slots.entries()) {
            if (search.isSupersetOf(tuple)) {
                const modified = modifier.apply(tuple);
                this.slots.set(slotId, modified);
                out.next(modified);

                for (const listener of this.listeners.values()) {
                    listener.update(tuple, modified);
                }
            }
        }
        out.done();
    }

    delete(search: Tuple, out: Stream) {
        for (const [slotId, tuple] of this.slots.entries()) {
            if (search.isSupersetOf(tuple)) {
                this.slots.delete(slotId);
                out.next(tuple);

                for (const listener of this.listeners.values()) {
                    listener.delete(tuple);
                }
            }
        }
        out.done();
    }
}