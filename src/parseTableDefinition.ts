
import TableMount, { TupleStreamCallback } from "./TableMount";
import parseTuple from "./parser/parseTuple";
import parseCommand from "./parseCommand";
import Graph from "./Graph";
import OutputStream from "./OutputStream";
import Tuple from "./Tuple";
import Stream from "./Stream";
import InMemoryTable from './InMemoryTable'
import { toTuple, toQuery, QueryLike, TupleLike } from './coerce'
import { isQuery } from './Query'
import Pipe, { newNullPipe } from './Pipe'
import { runQuery } from './runQuery'

type TableCallback = (input: Tuple, out: OutputStream) => void | Promise<void>

export type SingleTableDefinition = string | TableCallback | SingleTableDefinitionObj

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
    }

    return null;
}


export function setupTable(schemaLike: TupleLike, tableDef: SingleTableDefinition): TableMount {

    const schema = toTuple(schemaLike);

    if (typeof tableDef === 'string') {
        const foundMixin = setupTableFromMixin(schema, tableDef);
        if (foundMixin)
            return foundMixin;

        const mount = new TableMount(null, schema);
        mount.addQueryHandler('get', '', tableDef);
        return mount;
    }

    const mount = new TableMount(tableDef.name, schema);

    if (typeof tableDef === 'function') {
        mount.addHandler('find', toTuple([]), toTupleStreamCallback(tableDef as TableCallback));
        return mount;
    }

    if (typeof tableDef === 'string') {
        mount.addQueryHandler('find', toTuple([]), tableDef);
        return mount;
    }

    for (const commandStr in tableDef) {
        if (commandStr === 'name')
            continue;

        const command = parseCommand(commandStr);
        const handlerDef = tableDef[commandStr];

        if (typeof handlerDef === 'string' ) {
            mount.addQueryHandler(command.verb, command.tuple, handlerDef);
        } else {
            const callback = handlerDef as TableCallback;
            mount.addHandler(command.verb, command.tuple, toTupleStreamCallback(callback));
        }
    }

    return mount;
}

export default function parseTableDefinition(def: TableSetDefinition): TableMount[] {

    const mounts: TableMount[] = [];

    for (const schema in def) {
        const tableDef: SingleTableDefinition = def[schema];
        const mount = setupTable(schema, tableDef);
        mounts.push(mount);
    }

    return mounts;
}
