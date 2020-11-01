import Tuple, { singleTagToTuple } from "./Tuple"
import Stream from "./Stream"
import { symValueStringify, symValueType } from "./internalSymbols"
import { newSimpleTag } from "./TupleTag";

export default class Relation {
    tuples: Tuple[]
    cache: Map<string, any>

    [symValueType] = 'relation'

    constructor(tuples: Tuple[]) {
        this.tuples = tuples;
    }

    usingCache(key: string, builder: (rel: Relation) => any) {
        if (!this.cache)
            this.cache = new Map();

        if (!this.cache.has(key)) {
            const result = builder(this);
            this.cache.set(key, result);
            return result;
        }

        return this.cache.get(key);
    }

    append(tuples: Tuple[]) {
        return new Relation(this.tuples.concat(tuples));
    }

    *body() {
        for (const tuple of this.tuples) {
            if (!tuple.isCommandMeta())
                yield tuple;
        }
    }

    bodyArray() {
        return Array.from(this.body())
    }

    *errors() {
        for (const tuple of this.tuples) {
            if (tuple.isCommandError())
                yield tuple;
        }
    }

    header(): Tuple {
        return this.usingCache('header', (rel) => {
            if (rel.tuples.length === 0)
                return new Tuple([]);

            for (const tuple of rel.tuples) {
                if (tuple.isCommandSearchPattern())
                    return tuple.removeAttr('command-meta').removeAttr('search-pattern');
            }

            return new Tuple([newSimpleTag('error'), newSimpleTag('infer-header-not-supported')])
        });
    }

    errorsToErrorObject(): Error | null {
        for (const error of this.errors()) {
            return new Error(error.getVal('message'));
        }

        return null;
    }

    *withAttr(attr: string) {
        for (const tuple of this.tuples) {
            if (tuple.hasAttr(attr))
                yield tuple;
        }
    }

    oneWithAttr(attr: string) {
        for (const it of this.withAttr(attr))
            return it;
    }

    oneValue(attr: string) {
        const t = this.oneWithAttr(attr);
        if (!t)
            return null;
        return t.getVal(attr);
    }

    stringify() {
        return `Relation[${this.tuples.map(t => t.stringify()).join(', ')}]`;
    }

    stringifyBody() {
        return `[${Array.from(this.body()).map(t => t.stringify()).join(', ')}]`;
    }
}

export function relationToJsonable(rel: Relation) {
    return {
        type: 'relation',
        tuples: rel.tuples.map(t => t.stringify())
    }
}

export function jsonableToRelation(json: any): Relation {
    if (json.type !== 'relation') {
        throw new Error("jsonableToRelation: object doesn't have type = relation");
    }

    const tuples = json.tuples;
    return new Relation(tuples);
}

export function isRelation(val: any) {
    return val && (val[symValueType] === 'relation');
}
