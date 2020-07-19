import Tuple from "../Tuple";
import TableMount from "../TableMount";
import { jsObjectHandler } from "../NativeHandler";

interface SetupOpts {
    name?: string
    primaryKey: Tuple
    initialValue?: any
}

interface Result {
    object: any
    table: TableMount
}

export default function setupInMemoryObjectTable(opts: SetupOpts): Result {

    const object = opts.initialValue || {};
    const name = opts.name || `InMemoryObject(${opts.primaryKey.stringify()})`
    const table = new TableMount(name, opts.primaryKey.addNewTag2({doubleStar: true}));

    table.addHandler(`find-with attr`, jsObjectHandler(({attr}) => {
        return { attr, value: object[attr] }
    }));
    
    table.addHandler(`list-all`, jsObjectHandler(() => {
        const out = [];
        for (const k in object)
            out.push({attr: k, value: object[k]})
        return out;
    }));

    table.addHandler('insert attr value', jsObjectHandler(( { attr, value } ) => {
        object[attr] = value;
    }));

    return {
        table,
        object
    }

}
