import Tuple from "../Tuple";
import TableMount from "../TableMount";

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
    const primaryKeyStr = opts.primaryKey.stringify();

    table.addHandler(`select ${primaryKeyStr} attr((one)) value`, {
        protocol: 'js_object',
        func({attr}) {
            return { attr, val: object[attr] }
        }
    });
    
    table.addHandler(`select ${primaryKeyStr} attr value?`, {
        protocol: 'js_object',
        func() {
            const out = [];
            for (const k in object)
                out.push({attr: k, val: object[k]})
            return out;
        }
    });

    table.addHandler('insert **', {
        protocol: 'tuple',
        func: (search: Tuple) => {
            
        }
    });

    return {
        table,
        object
    }

}
