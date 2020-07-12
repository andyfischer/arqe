import Tuple from "../Tuple";
import TableMount from "../TableMount";

interface SetupOpts {
    name?: string
    primaryKey: Tuple
    keyAttr: string
    initialValue: any
}

interface Result {
    obj: any
    table: TableMount
}

export function setup(opts: SetupOpts): Result {

    const obj = opts.initialValue || {};
    const name = opts.name || `InMemoryObject(${opts.primaryKey.stringify()})`
    const table = new TableMount(name, opts.primaryKey.addNewTag2({doubleStar: true}));

    

    return {
        table,
        obj
    }

}