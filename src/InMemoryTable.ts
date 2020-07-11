
import Pattern from './Pattern'
import IDSource from './utils/IDSource'
import Tuple from './Tuple'
import Stream from './Stream'
import TableStorage, { } from './TableStorage'
import TupleModification from './TupleModification'
import TableListener from './TableListener'
import TableMount from './TableMount'

export default class Table implements TableStorage {
    name: string
    supportsCompleteScan = true
    pattern: Pattern

    nextSlotId: IDSource = new IDSource();
    slots = new Map<string, Tuple>();

    listeners = new Map<string, TableListener>();

    mount: TableMount

    constructor(name: string, pattern: Pattern) {
        this.name = name;
        this.pattern = pattern;

        this.mount = new TableMount(name, pattern);
        this.mount.addHandler('select **', this.select.bind(this));
        this.mount.addHandler('insert **', this.insert.bind(this));
        this.mount.addHandler('update **', this.update.bind(this));
        this.mount.addHandler('delete **', this.delete.bind(this));
    }

    select(pattern: Tuple, out: Stream) {
        for (const [slotId, tuple] of this.slots.entries())
            if (pattern.isSupersetOf(tuple))
                out.next(tuple);

        out.done();
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
