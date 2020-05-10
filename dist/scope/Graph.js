"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Relation_1 = __importDefault(require("./Relation"));
const createSearch_1 = __importDefault(require("./createSearch"));
const parseTag_1 = __importDefault(require("./parseTag"));
const MissingValue = Symbol('missing');
class Graph {
    constructor(parent) {
        this.relations = {};
        this.searches = {};
        this.parent = parent;
    }
    del(pattern) {
        delete this.relations[pattern];
        for (const livePattern in this.searches) {
            this.searches[livePattern].maybeDelete(pattern);
        }
    }
    insert(key, value) {
        if (!this.relations[key]) {
            const rel = new Relation_1.default();
            rel.key = key;
            const parsed = parseTag_1.default(key);
            rel.tagCount = parsed.tagCount;
            this.relations[key] = rel;
            for (const pattern in this.searches) {
                this.searches[pattern].maybeInclude(parsed);
            }
        }
        this.relations[key].value = value;
    }
    exists(key) {
        return this.findOne(key, MissingValue) !== MissingValue;
    }
    findOne(key, defaultValue) {
        const relation = this.relations[key];
        if (relation)
            return relation.value;
        if (this.parent)
            return this.parent.findOne(key, defaultValue);
        return defaultValue;
    }
    find(pattern) {
        let searchObj = this.searches[pattern];
        if (!searchObj) {
            searchObj = createSearch_1.default(this, pattern);
            this.searches[pattern] = searchObj;
        }
        return searchObj.latest(this);
    }
    findExt(pattern) {
        let searchObj = this.searches[pattern];
        if (!searchObj) {
            searchObj = createSearch_1.default(this, pattern);
            this.searches[pattern] = searchObj;
        }
        return searchObj.latestExt(this);
    }
    findAsObject(pattern) {
        const out = {};
        for (const result of this.findExt(pattern)) {
            out[result.remainingTag] = result.value;
        }
        return out;
    }
}
exports.default = Graph;
//# sourceMappingURL=Graph.js.map