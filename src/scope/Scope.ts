
import Slot from './Slot'
import Relation from './Relation'

const MissingValue = Symbol('missing')

function normalizeTags(tags: { [key: string]: string }) {
    const keys = Object.keys(tags);
    keys.sort();

    const pairs = [];

    for (const key of keys) {
        pairs.push(key + '=' + tags[key])
    }

    return pairs.join(',');
}

export default class Scope {
    parent?: Scope

    slots: { [name: string]: Slot } = {}
    relations: { [ntags: string]: Relation } = {}

    constructor(parent?: Scope) {
        this.parent = parent;
    }

    createSlot(name: string) {
        if (this.slots[name])
            throw new Error('slot already exists: ' + name);

        const slot = new Slot()
        this.slots[name] = slot
        slot.empty = true;
    }

    createSlotAndSet(name: string, initialValue: any) {
        if (this.slots[name])
            throw new Error('slot already exists: ' + name);

        const slot = new Slot()
        this.slots[name] = slot
        slot.empty = false;
        slot.value = initialValue;
    }

    getOptional(name: string, defaultValue: any) {
        const slot = this.slots[name];
        if (slot && !slot.empty)
            return slot.value;

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
        if (!this.slots[name])
            throw new Error("no slot with name: " + name);

        const slot = this.slots[name];
        slot.empty = false;
        slot.value = value;
    }

    modify(name: string, callback: (val: any) => any) {
        if (!this.slots[name])
            throw new Error("no slot with name: " + name);

        const slot = this.slots[name];

        if (slot.empty)
            throw new Error("can't modify, slot has no value: " + name);

        slot.value = callback(slot.value);
    }

    deleteRelation(tags: { [key: string]: string }) {
        const ntags = normalizeTags(tags);
        delete this.relations[ntags];
    }

    insert(tags: { [key: string]: string }, value) {
        const ntags = normalizeTags(tags);

        if (!this.relations[ntags]) {
            const rel = new Relation()
            rel.tags = tags;
            rel.tagCount = Object.keys(rel.tags).length;
            this.relations[ntags] = rel
        }

        this.relations[ntags].value = value;
    }

    find(tags: { [key: string]: string }) {

        const found = this.findOptional(tags, MissingValue);
        const ntags = normalizeTags(tags);
        if (found === MissingValue)
            throw new Error("relation not found: " + ntags);

        return found;
    }

    findOptional(tags: { [key: string]: string }, defaultValue) {
        const ntags = normalizeTags(tags);
        const relation = this.relations[ntags];

        if (relation)
            return relation.value;

        if (this.parent)
            return this.parent.findOptional(tags, defaultValue);

        return defaultValue;
    }

    findPairsWithKey(knownTagKey: string, knownTagValue: string, starTag: string): any {
        const out = {}
        for (const ntags in this.relations) {
            const relation = this.relations[ntags];

            if (relation.tagCount === 2
                    && relation.tags[knownTagKey] === knownTagValue
                    && relation.tags[starTag] != null) {
                out[relation.tags[starTag]] = relation.value;
            }
        }
        return out;
    }
}

