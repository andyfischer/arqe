
import Pattern from './Pattern'
import IDSource from './utils/IDSource'
import Tuple from './Tuple'
import Stream from './Stream'
import TableInterface from './TableInterface'
import GenericStream, { StreamCombine } from './GenericStream'

export default class Table implements TableInterface {
    name: string
    supportsScan = true
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
