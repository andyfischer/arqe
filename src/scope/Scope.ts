
import Slot from './Slot'
import Relation from './Relation'
import RelationSearch from './RelationSearch'
import createSearch from './createSearch'
import parseTag from './parseTag'

const MissingValue = Symbol('missing')

export default class Scope {
    parent?: Scope

    slots: { [name: string]: Slot } = {}
    relations: { [tag: string]: Relation } = {}
    searches: { [pattern: string]: RelationSearch } = {}

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

    del(tags: string) {
        delete this.relations[tags];

        for (const pattern in this.searches) {
            this.searches[pattern].maybeDelete(tags);
        }
    }

    insert(tags: string, value?: any) {

        if (!this.relations[tags]) {
            const rel = new Relation()
            rel.tags = tags;
            const parsed = parseTag(tags);
            rel.tagCount = parsed.tagCount;
            this.relations[tags] = rel;

            for (const pattern in this.searches) {
                this.searches[pattern].maybeInclude(parsed);
            }
        }

        this.relations[tags].value = value;
    }

    find(tags: string) {

        const found = this.findOptional(tags, MissingValue);
        if (found === MissingValue)
            throw new Error("relation not found: " + tags);

        return found;
    }

    findOptional(tag: string, defaultValue) {
        const relation = this.relations[tag];

        if (relation)
            return relation.value;

        if (this.parent)
            return this.parent.findOptional(tag, defaultValue);

        return defaultValue;
    }

    search(pattern: string) {
        let searchObj = this.searches[pattern];
        if (!searchObj) {
            searchObj = createSearch(this, pattern);
            this.searches[pattern] = searchObj;
        }

        return searchObj.latestResultsAsObject(this);
    }
}

