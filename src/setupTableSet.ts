
import TableMount, { TupleStreamCallback } from "./TableMount";
import parseTuple from "./stringFormat/parseTuple";
import parseCommand from "./parseCommand";
import Graph from "./Graph";
import OutputStream from "./OutputStream";
import TuplePatternMatcher from "./tuple/TuplePatternMatcher";
import Tuple from "./Tuple";
import Stream from "./Stream";
import { TupleLike } from './coerce'
import InMemoryTable from './tables/InMemoryTable'
import { toTuple } from './coerce'

type TableCallback = (input: Tuple, out: OutputStream) => void | Promise<void>

type SingleTableDefinition = string | SingleTableDefinitionObj

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

function setupTableFromTemplate(schema: Tuple, template: string) {
    if (template === 'memory') {
        const table = new InMemoryTable(null, schema);
        return table.mount;
    } else {
        throw new Error("template definition not recognized: " + template);
    }
}

export function setupTable(schemaStr: string, tableDef: SingleTableDefinition): TableMount {

    const schema = toTuple(schemaStr);

    if (typeof tableDef === 'string') {
        return setupTableFromTemplate(schema, tableDef);
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

export function defineVerbV2(graph: Graph, name: string, inputScheme: string, callback: TableCallback) {
    graph.addTable(setupTable(`verb[${name}] ` + inputScheme, {
        name: 'verb_' + name,
        'run': callback
    }));
}
