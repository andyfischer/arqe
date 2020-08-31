import Tuple from "../Tuple";
import TableMount from "../TableMount";
import toStream from "../tuple/TupleCallbackToStream";

export class ValueAccessor {
    value: any

    set(v) {
        this.value = v;
    }

    get() {
        return this.value;
    }
}

export function setupSingleValueTable(name: string, base: Tuple, valueAttr: string) {
    valueAttr = valueAttr || 'value';
    const schema = base.addSimpleTag(valueAttr);
    const table = new TableMount(name, schema);
    const accessor = new ValueAccessor();

    table.addHandler(`list-all`, '', toStream((search) => {
        const found = search.setVal(valueAttr, accessor.value);
        return found;
    }));

    table.addHandler(`set`, `${valueAttr}`, toStream((tuple) => {
        accessor.value = tuple.getVal(valueAttr);
    }))

    return {
        table,
        accessor
    }
}