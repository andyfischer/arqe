import Tuple from "../Tuple";
import TableMount from "../TableMount";
import Stream from "../Stream";

interface SetupOpts {
    name?: string
    baseKey: Tuple
    keyAttr?: string
    valueAttr?: string
    initialValue?: Map<any,any>
}

interface Result {
    map: Map<any,any>
    table: TableMount
}

export default function setupInMemoryObjectTable(opts: SetupOpts): Result {

    const map = opts.initialValue || new Map();
    const name = opts.name || `InMemoryObject(${opts.baseKey.stringify()})`
    const keyAttr = opts.keyAttr || 'key'
    const valueAttr = opts.valueAttr || 'value'

    const schema = opts.baseKey.addSimpleTag(keyAttr).addSimpleTag(valueAttr);
    const table = new TableMount(name, schema);

    table.addHandler(`find-with`, `${keyAttr}`, (search, out: Stream) => {
        const key = search.getVal(keyAttr);
        const found = search.setVal(valueAttr, map.get(key));
        out.next(found);
        out.done();
    });
    
    table.addHandler(`list-all`, '', (search, out: Stream) => {
        for (const [ k, v ] of map.entries()) {
            const found = search.setVal(keyAttr, k).setVal(valueAttr, v);
            out.next(found);
        }
        out.done();
    });

    table.addHandler(`insert`, `${keyAttr} ${valueAttr}`, (tuple: Tuple, out: Stream) => {
        map.set(keyAttr, tuple.getVal(keyAttr));
        out.done();
    });

    return {
        table,
        map
    }
}