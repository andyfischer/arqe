import TupleTag, { newSimpleTag } from "./TupleTag";
import Tuple from "./Tuple";

export default class TupleMap {
    data: Map<string,TupleTag>

    constructor(data: Map<string,TupleTag>) {
        this.data = data;
        Object.freeze(this.data);
    }

    get(attr: string): TupleTag {
        return this.data.get(attr);
    }

    getValue(attr: string): any {
        const tag = this.data.get(attr);
        return tag && tag.value;
    }

    setValue(attr: string, value: any) {
        const newData: Map<string,TupleTag> = new Map();

        // create clone
        for (const [k,v] of this.data.entries()) {
            newData.set(k,v);
        }

        newData.set(attr, newSimpleTag(attr, value));
        return new TupleMap(newData);
    }

    has(attr: string) {
        return this.data.has(attr);
    }

    keys() {
        return this.data.keys();
    }

    values() {
        return this.data.values();
    }

    toTuple() {
        // TODO improve
        return new Tuple(Array.from(this.values()));
    }
}