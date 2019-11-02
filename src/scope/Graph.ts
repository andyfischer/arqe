
import Relation from './Relation'
import LiveSearch from './LiveSearch'
import FindExtResult from './FindExtResult'
import createSearch from './createSearch'
import parseTag from './parseTag'

const MissingValue = Symbol('missing')

export default class Graph {
    parent?: Graph

    relations: { [key: string]: Relation } = {}
    searches: { [pattern: string]: LiveSearch } = {}

    constructor(parent?: Graph) {
        this.parent = parent;
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

    findOne(key: string, defaultValue: any) {
        const relation = this.relations[key];

        if (relation)
            return relation.value;

        if (this.parent)
            return this.parent.findOne(key, defaultValue);

        return defaultValue;
    }

    find(pattern: string): any[] {
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

