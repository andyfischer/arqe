import Graph from "../Graph";
import Tuple from "../Tuple";
import { receiveToTupleList } from "../receiveUtils";

export function run(graph: Graph, command: string): string[] {
    let out: Tuple[] = null;
    const receiver = receiveToTupleList(l => { out = l });

    graph.run(command, receiver);

    if (out === null)
        throw new Error(`command didn't finish synchronously: ${command}`)

    for (const t of out) {
        if (t.isCommandError())
            throw new Error(t.getVal('message'))
    }

    return (out
        .filter(t => !t.isCommandMeta())
        .map(t => t.stringify()));
}