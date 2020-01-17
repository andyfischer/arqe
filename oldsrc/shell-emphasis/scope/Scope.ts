
import Slot from './Slot'
import Relation from './Relation'
import LiveSearch from './LiveSearch'
import FindExtResult from './FindExtResult'
import createSearch from './createSearch'
import parseTag from './parseTag'
import Graph from './Graph'

const MissingValue = Symbol('missing')

export default class Scope {
    graph: Graph

    constructor(graph: Graph) {
        if (!graph)
            throw new Error('missing: graph');
        this.graph = graph
    }

    createSlot(name: string) {

        const key = 'slot/' + name;

        if (this.graph.exists(key))
            throw new Error('slot already exists: ' + name);

        const slot = new Slot()
        slot.empty = true;
        this.graph.insert(key, slot);
        return slot;
    }

    createSlotAndSet(name: string, initialValue: any) {

        const slot = this.createSlot(name);
        slot.empty = false;
        slot.value = initialValue;
    }

    getOptional(name: string, defaultValue: any) {

        const key = 'slot/' + name;
        const slot = this.graph.findOne(key, null);

        if (slot && !slot.empty)
            return slot.value;

        return defaultValue;
    }

    get(name: string) {
        const found = this.getOptional(name, MissingValue);

        if (found === MissingValue)
            throw new Error('value not found for: ' + name);

        return found;
    }

    set(name: string, value: any) {
        const key = 'slot/' + name;
        const slot = this.graph.findOne(key, null);

        if (!slot)
            throw new Error("no slot with name: " + name);

        slot.empty = false;
        slot.value = value;
    }

    modify(name: string, callback: (val: any) => any) {
        const key = 'slot/' + name;
        const slot = this.graph.findOne(key, null);

        if (!slot)
            throw new Error("no slot with name: " + name);

        slot.empty = false;
        slot.value = callback(slot.value);
    }
}
