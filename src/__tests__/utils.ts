import Graph, { GraphOptions } from "../Graph";
import Tuple from "../Tuple";
import Relation from "../Relation";

export function preset(graph: Graph, tuples: string[]) {
    for (const t of tuples) {
        graph.run(`set ${t}`);
    }
}

export function setupGraph(opts?: GraphOptions) {
    const graph = new Graph(opts);

    return {
        graph,
        run: (cmd) => graph.run(cmd)
    };
}
