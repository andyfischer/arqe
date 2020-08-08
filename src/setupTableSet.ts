import TableMount, { TupleStreamCallback } from "./TableMount";
import parseTuple from "./parseTuple";

interface SingleTableDefinition {
    name: string
    [commandStr: string]: string | TupleStreamCallback
}

interface TableSetDefinition {
    [schema: string]: SingleTableDefinition
}

export default function setupTableSet(def: TableSetDefinition): TableMount[] {

    const mounts: TableMount[] = [];

    for (const schema in def) {
        const tableDef: SingleTableDefinition = def[schema];

        const mount = new TableMount(tableDef.name, parseTuple(schema));

        for (const commandStr in tableDef) {
            if (commandStr === 'name')
                continue;

            mount.addHandler(commandStr, tableDef[commandStr] as TupleStreamCallback);
        }

        mounts.push(mount);
    }

    return mounts;
}