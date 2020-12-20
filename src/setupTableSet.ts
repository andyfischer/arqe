
import TableMount, { TupleStreamCallback } from "./TableMount";
import parseTuple from "./stringFormat/parseTuple";
import parseCommand from "./parseCommand";
import Graph from "./Graph";
import OutputStream from "./OutputStream";
import Tuple from "./Tuple";
import Stream from "./Stream";
import { TupleLike } from './coerce'
import InMemoryTable from './standardTables/InMemoryTable'
import { toTuple } from './coerce'

type TableCallback = (input: Tuple, out: OutputStream) => void | Promise<void>

export type SingleTableDefinition = string | SingleTableDefinitionObj

interface SingleTableDefinitionObj {
    name?: string
    [commandStr: string]: string | TableCallback
}

export interface TableSetDefinition {
    [schema: string]: SingleTableDefinition
}

function toTupleStreamCallback(tableCallback: TableCallback): TupleStreamCallback {
    return (input: Tuple, out: Stream) => {
        const context = new OutputStream(input, out);
        return tableCallback(input, context);
    }
}

function setupTableFromMixin(schema: Tuple, mixin: string) {
    if (mixin === 'memory') {
        const table = new InMemoryTable(null, schema);
        return table.mount;
    } else {
        throw new Error("mixin definition not recognized: " + mixin);
    }
}

export function setupTable(schemaLike: TupleLike, tableDef: SingleTableDefinition): TableMount {

    const schema = toTuple(schemaLike);

    if (typeof tableDef === 'string') {
        return setupTableFromMixin(schema, tableDef);
    }

    const mount = new TableMount(tableDef.name, schema);

    for (const commandStr in tableDef) {
        if (commandStr === 'name')
            continue;

        const command = parseCommand(commandStr);
        const callback: TableCallback = tableDef[commandStr] as TableCallback;
        mount.addHandler(command.verb, command.tuple, toTupleStreamCallback(callback));
    }

    return mount;
}

export default function setupTableSet(def: TableSetDefinition): TableMount[] {

    const mounts: TableMount[] = [];

    for (const schema in def) {
        const tableDef: SingleTableDefinition = def[schema];
        const mount = setupTable(schema, tableDef);
        mounts.push(mount);
    }

    return mounts;
}
