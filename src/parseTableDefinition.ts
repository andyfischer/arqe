
import TableMount, { TupleStreamCallback } from "./TableMount";
import parseTuple from "./stringFormat/parseTuple";
import parseCommand from "./parseCommand";
import Graph from "./Graph";
import OutputStream from "./OutputStream";
import Tuple from "./Tuple";
import Stream from "./Stream";
import { TupleLike } from './coerce'
import InMemoryTable from './standardTables/InMemoryTable'
import { toTuple, toQuery, QueryLike } from './coerce'
import { isQuery } from './Query'

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

function setupTableFromQuery(schema: Tuple, queryLike: QueryLike) {
    const query = toQuery(queryLike);

    const mount = new TableMount(null, schema);


    mount.addHandler('get', null, (input, out) => {

        // Execute the 'rewrite' query, using the incoming input.
        // QueryContext needs scopes.
        // Terms need symbol IDs for scope association. (already have this?)
        // Support a '*' verb handler

        // run the query, providing input via 'from' tags?
        // XX lexical scoping?
        // target table might have a custom mount pattern?
        // late binding?
        // just implement as pipe processing?
        // use 'alias' or 'redirect' command?
    });

    //mount.addHandler('set', );

    return mount;
}

export function setupTable(schemaLike: TupleLike, tableDef: SingleTableDefinition): TableMount {

    const schema = toTuple(schemaLike);

    if (typeof tableDef === 'string') {
        const foundMixin = setupTableFromMixin(schema, tableDef);
        if (foundMixin)
            return foundMixin;

        const fromQuery = setupTableFromQuery(schema, tableDef)
        return fromQuery;
    }

    const mount = new TableMount(tableDef.name, schema);

    if (typeof tableDef === 'function') {
        mount.addHandler('find', toTuple([]), toTupleStreamCallback(tableDef as TableCallback));
        return mount;
    }

    for (const commandStr in tableDef) {
        if (commandStr === 'name')
            continue;

        const command = parseCommand(commandStr);
        const callback: TableCallback = tableDef[commandStr] as TableCallback;
        mount.addHandler(command.verb, command.tuple, toTupleStreamCallback(callback));
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
