
import IDSource from '../utils/IDSource'
import Tuple from '../Tuple'
import Stream from '../Stream'
import TableMount from '../TableMount'
import { tupleToModification, modificationPatternToFilter } from '../TupleModification'

export default class InMemoryTable {
    name: string
    pattern: Tuple

    nextSlotId: IDSource = new IDSource();
    slots = new Map<string, Tuple>();

    listeners = new Map<string, true>();
    mount: TableMount

    constructor(name: string, pattern: Tuple) {
        this.name = name;
        this.pattern = pattern;

        this.mount = new TableMount(name, pattern);
        this.mount.addHandler('list-all', '', this.findAll.bind(this));
        this.mount.addHandler('insert', '', this.insert.bind(this) );
        this.mount.addHandler('update', '', this.update.bind(this) );
        this.mount.addHandler('delete', '', this.delete.bind(this) );
        this.mount.addHandler('add-listener', '', this.addListener.bind(this));
        this.mount.addHandler('remove-listener', '', this.removeListener.bind(this));
    }

    findAll(tuple: Tuple, out: Stream) {
        for (const [_, tuple] of this.slots.entries())
            out.next(tuple);

        out.done();
    }

    select(pattern: Tuple, out: Stream) {
        for (const [_, tuple] of this.slots.entries())
            if (pattern.isSupersetOf(tuple))
                out.next(tuple);

        out.done();
    }

    insert(insertTuple: Tuple, out: Stream) {
        // Check if it exists
        for (const [_, tuple] of this.slots.entries()) {
            if (insertTuple.isSupersetOf(tuple)) {
                // Already have this
                out.next(tuple);
                out.done();
                return;
            }
        }

        const slotId = this.nextSlotId.take();
        this.slots.set(slotId, insertTuple);

        out.next(insertTuple)
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
            }
        }
        out.done();
    }

    delete(search: Tuple, out: Stream) {
        for (const [slotId, tuple] of this.slots.entries()) {
            if (search.isSupersetOf(tuple)) {
                this.slots.delete(slotId);
                out.next(tuple);
            }
        }
        out.done();
    }

    addListener(input: Tuple, out: Stream) {
        const id = input.getVal("id");
        this.listeners.set(id, true);
    }

    removeListener(input: Tuple, out: Stream) {
        const id = input.getVal("id");
        this.listeners.delete(id);
    }
}
