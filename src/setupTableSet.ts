import TableMount, { TupleStreamCallback } from "./TableMount";
import parseTuple from "./parseTuple";
import parseCommand from "./parseCommand";
import Graph from "./Graph";

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

            const command = parseCommand(commandStr);
            mount.addHandler(command.verb, command.pattern, tableDef[commandStr] as TupleStreamCallback);
        }

        mounts.push(mount);
    }

    return mounts;
}

export function graphWithTableSet(def: TableSetDefinition): Graph {
    const graph = new Graph();
    graph.addTables(setupTableSet(def));
    return graph;
}