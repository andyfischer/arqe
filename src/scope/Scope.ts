
import Slot from './Slot'

const MissingValue = Symbol('missing');

interface ConstructorOptions {
    parent?: Scope
}

export default class Scope {
    parent?: Scope

    slots: { [name: string]: Slot } = {}

    constructor(opts: ConstructorOptions = {}) {
        this.parent = opts.parent;
    }

    createSlot(name) {
        if (this.slots[name])
            throw new Error('slot already exists: ' + name);

        this.slots[name] = new Slot()
    }

    getOptional(name: string, defaultValue: any) {
        if (this.slots[name])
            return this.slots[name].current;

        if (this.parent)
            return this.parent.getOptional(name, defaultValue);

        return defaultValue;
    }

    get(name: string) {
        const found = this.getOptional(name, MissingValue);

        if (found === MissingValue)
            throw new Error('value not found for: ' + name);

        return found;
    }

    set(name: string, value: any) {
        if (!this.slots[name]) {
            throw new Error("no slot with name: " + name);
        }

        const slot = this.slots[name];
        slot.current = value;
    }

    modify(name: string, callback: (val: any) => any) {
        if (!this.slots[name]) {
            throw new Error("no slot with name: " + name);
        }

        const slot = this.slots[name];

        slot.current = callback(slot.current);
    }
}
