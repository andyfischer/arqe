
import Pattern from './Pattern'
import IDSource from './utils/IDSource'
import Tuple from './Tuple'
import Stream from './Stream'
import TableListener from './TableListener'
import TableMount from './TableMount'
import { tupleToModification } from './TupleModification'
import { modificationPatternToFilter } from './planQuery'

export default class Table {
    name: string
    pattern: Pattern

    nextSlotId: IDSource = new IDSource();
    slots = new Map<string, Tuple>();

    listeners = new Map<string, TableListener>();
    mount: TableMount

    constructor(name: string, pattern: Pattern) {
        this.name = name;
        this.pattern = pattern;

        this.mount = new TableMount(name, pattern);
        this.mount.addHandler('select **', {func: this.select.bind(this), protocol: 'tuple' });
        this.mount.addHandler('insert **', {func: this.insert.bind(this), protocol: 'tuple' });
        this.mount.addHandler('update **', {func: this.update.bind(this), protocol: 'tuple' });
        this.mount.addHandler('delete **', {func: this.delete.bind(this), protocol: 'tuple' });
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

    update(updateTuple: Tuple, out: Stream) {

        const filter = modificationPatternToFilter(updateTuple);
        const modifier = tupleToModification(updateTuple);

        for (const [slotId, tuple] of this.slots.entries()) {
            if (filter.isSupersetOf(tuple)) {
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
