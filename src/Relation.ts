import Tuple, { singleTagToTuple } from "./Tuple"
import Stream from "./Stream"
import { symValueStringify, symValueType } from "./internalSymbols"
import { newSimpleTag } from "./TupleTag";

export default class Relation {
    tuples: Tuple[]
    facts: Map<string, any> = new Map();

    [symValueType] = 'relation'

    constructor(tuples: Tuple[]) {
        this.tuples = tuples;
    }

    getFact(key: string) {
        return this.facts.get(key);
    }

    setFact(key: string, value) {
        this.facts.set(key, value);
    }

    getOrComputeFact(key: string, builder: (rel: Relation) => any) {
        if (!this.facts.has(key)) {
            const result = builder(this);
            this.facts.set(key, result);
            return result;
        }

        return this.facts.get(key);
    }

    append(tuples: Tuple[]) {
        return new Relation(this.tuples.concat(tuples));
    }

    remapTuples(func: (t: Tuple) => Tuple | null) {
        let out = [];
        for (const t of this.tuples) {
            const mapped = func(t)
            if (mapped)
                out.push(mapped);
        }
        return new Relation(out);
    }

    *body() {
        for (const tuple of this.tuples) {
            if (!tuple.isCommandMeta())
                yield tuple;
        }
    }

    bodyArr() {
        return Array.from(this.body())
    }

    *column(attr: string) {
        for (const t of this.body())
            if (t.hasValue(attr))
                yield t.getValue(attr);
    }

    columnArr(attr: string) {
        return Array.from(this.column(attr));
    }

    header(): Tuple {
        return this.getOrComputeFact('header', (rel) => {
            if (rel.tuples.length === 0)
                return new Tuple([]);

            for (const tuple of rel.tuples) {
                if (tuple.isCommandSearchPattern())
                    return tuple.removeAttr('command-meta').removeAttr('search-pattern');
            }

            return new Tuple([newSimpleTag('error'), newSimpleTag('infer-header-not-supported')])
        });
    }

    firstError(): Tuple | null {
        for (const error of this.errors())
            return error;
        return null;
    }

    hasError() {
        for (const error of this.errors())
            return true;
        return false;
    }
    
    *errors() {
        for (const tuple of this.tuples) {
            if (tuple.isCommandError())
                yield tuple;
        }
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

    first() {
        for (const t of this.body())
            return t;
    }

    one(filter?: Tuple) {
        if (filter)
            throw new Error("lol one(filter) not implemented yet");

        for (const tuple of this.tuples) {
            if (tuple.isCommandMeta())
                continue;

            return tuple;
        }

        return null;
    }

    oneValue(attr: string) {
        for (const it of this.body())
            if (it.hasValue(attr))
                return it.getValue(attr);

        throw new Error("no value found for: " + attr);
    }

    stringify() {
        return `[Relation ${this.tuples.map(t => `(${t.stringify()})`).join(', ')} ]`;
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
