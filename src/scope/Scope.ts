
import Slot from './Slot'
import Relation from './Relation'
import LiveSearch from './LiveSearch'
import FindExtResult from './FindExtResult'
import createSearch from './createSearch'
import parseTag from './parseTag'

const MissingValue = Symbol('missing')

export default class Scope {
    parent?: Scope

    relations: { [key: string]: Relation } = {}
    searches: { [pattern: string]: LiveSearch } = {}

    constructor(parent?: Scope) {
        this.parent = parent;
    }

    createSlot(name: string) {

        const key = 'slot/' + name;

        if (this.exists(key))
            throw new Error('slot already exists: ' + name);

        const slot = new Slot()
        slot.empty = true;
        this.insert(key, slot);
        return slot;
    }

    createSlotAndSet(name: string, initialValue: any) {

        const slot = this.createSlot(name);
        slot.empty = false;
        slot.value = initialValue;
    }

    getOptional(name: string, defaultValue: any) {

        const key = 'slot/' + name;
        const slot = this.findOne(key, null);

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
        const key = 'slot/' + name;
        const slot = this.findOne(key, null);

        if (!slot)
            throw new Error("no slot with name: " + name);

        slot.empty = false;
        slot.value = value;
    }

    modify(name: string, callback: (val: any) => any) {
        const key = 'slot/' + name;
        const slot = this.findOne(key, null);

        if (!slot)
            throw new Error("no slot with name: " + name);

        slot.empty = false;
        slot.value = callback(slot.value);
    }

    del(pattern: string) {
        delete this.relations[pattern];

        for (const livePattern in this.searches) {
            this.searches[livePattern].maybeDelete(pattern);
        }
    }

    insert(key: string, value?: any) {

        if (!this.relations[key]) {
            const rel = new Relation()
            rel.key = key;
            const parsed = parseTag(key);
            rel.tagCount = parsed.tagCount;
            this.relations[key] = rel;

            for (const pattern in this.searches) {
                this.searches[pattern].maybeInclude(parsed);
            }
        }

        this.relations[key].value = value;
    }

    exists(key: string) {
        return this.findOne(key, MissingValue) !== MissingValue;
    }

    find(key: string) {

        const found = this.findOptional(key, MissingValue);
        if (found === MissingValue)
            throw new Error("relation not found: " + key);

        return found;
    }

    findOne(key: string, defaultValue: any) {
        const relation = this.relations[key];

        if (relation)
            return relation.value;

        if (this.parent)
            return this.parent.findOne(key, defaultValue);

        return defaultValue;
    }

    findOptional(key: string, defaultValue) {
        const relation = this.relations[key];

        if (relation)
            return relation.value;

        if (this.parent)
            return this.parent.findOptional(key, defaultValue);

        return defaultValue;
    }

    findNew(pattern: string): any[] {
        let searchObj = this.searches[pattern];
        if (!searchObj) {
            searchObj = createSearch(this, pattern);
            this.searches[pattern] = searchObj;
        }

        return searchObj.latest(this);
    }

    findExt(pattern: string): FindExtResult[] {

        let searchObj = this.searches[pattern];
        if (!searchObj) {
            searchObj = createSearch(this, pattern);
            this.searches[pattern] = searchObj;
        }

        return searchObj.latestExt(this);
    }

    findAsObject(pattern: string): any {
        const out = {};
        for (const result of this.findExt(pattern)) {
            out[result.remainingTag] = result.value;
        }
        return out;
    }
}

