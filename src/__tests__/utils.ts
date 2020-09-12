import Graph from "../Graph";
import Tuple from "../Tuple";
import { receiveToTupleList } from "../receiveUtils";

interface Options {
    withHeaders?: boolean
}

export function run(graph: Graph, command: string, opts: Options = {}): string[] {
    let out: Tuple[] = null;
    const receiver = receiveToTupleList(l => { out = l });

    graph.run(command, receiver);

    if (out === null)
        throw new Error(`command didn't finish synchronously: ${command}`)

    for (const t of out) {
        if (t.isCommandError())
            throw new Error(t.getVal('message'))
    }

    let result = out;

    if (!opts.withHeaders)
        result = result.filter(t => !t.isCommandMeta())

    return (result
        .map(t => t.stringify()));
}

export function preset(graph: Graph, tuples: string[]) {
    for (const t of tuples) {
        graph.run(`set ${t}`);
    }

}
