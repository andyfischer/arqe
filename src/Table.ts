
import Pattern from './Pattern'
import IDSource from './utils/IDSource'
import Tuple from './Tuple'
import { ReceiverFunc, TupleReceiverFunc, SlotReceiverFunc, TupleReceiverCombine } from './ReceiverFunc'

export default class Table {
    name: string
    pattern: Pattern

    nextSlotId: IDSource = new IDSource();
    _slots = new Map<string, Tuple>();

    constructor(name: string, pattern: Pattern) {
        this.name = name;
        this.pattern = pattern;
    }

    scan(receiver: SlotReceiverFunc) {
        for (const [slotId, tuple] of this._slots.entries())
            receiver({slotId, tuple})

        receiver(null);
    }

    set(slotId: string, tuple: Tuple, receiver: TupleReceiverFunc) {
        this._slots.set(slotId, tuple);
        receiver(null);
    }

    delete(slotId: string, receiver: TupleReceiverFunc) {
        this._slots.delete(slotId);
        receiver(null);
    }
}
