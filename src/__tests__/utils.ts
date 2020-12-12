import Graph from "../Graph";
import Tuple from "../Tuple";
import Relation from "../Relation";
import { receiveToTupleList, receiveToRelation } from "../receiveUtils";

interface Options {
    withHeaders?: boolean
    allowErrors?: boolean
}

export function run(graph: Graph, command: string, opts: Options = {}): string[] {
    let out: Tuple[] = null;
    const receiver = receiveToTupleList(l => { out = l });

    graph.run(command, receiver);

    if (out === null)
        throw new Error(`command didn't finish synchronously: ${command}`)

    if (!opts.allowErrors) {
        for (const t of out) {
            if (t.isCommandError())
                throw new Error(t.getVal('message'))
        }
    }

    let result = out;

    if (!opts.withHeaders)
        result = result.filter(t => !t.isCommandMeta())

    return (result
        .map(t => t.stringify()));
}

export function toRelation(graph: Graph, command: string) {

    let out: Relation = null;

    graph.run(command, receiveToRelation(rel => { out = rel; }));

    if (out === null)
        throw new Error(`command didn't finish synchronously: ${command}`)

    return out;
}

export function preset(graph: Graph, tuples: string[]) {
    for (const t of tuples) {
        graph.run(`set ${t}`);
    }
}

export function setupGraph() {
    const graph = new Graph();
    const localRun = (cmd: string, options = {}) => run(graph, cmd, options);

    return {
        graph,
        toRelation: (cmd) => toRelation(graph, cmd),
        run: localRun,
        runv2: (cmd) => graph.run(cmd)
    };
}
