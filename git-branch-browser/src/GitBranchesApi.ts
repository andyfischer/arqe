import { GraphLike, Tuple, receiveToTupleListPromise } from "./fs"

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        if (typeof graph.run !== 'function') {
            throw new Error('(code-generation/gitBranches constructor) expected Graph or GraphLike: ' + graph);
        }

        this.graph = graph;
    }

    async getBranches(dir: string): Promise<string[]> {
        const command = `get git dir(${dir}) branch/*`;

        const { receiver, promise } = receiveToTupleListPromise();
        this.graph.run(command, receiver)
        const rels: Tuple[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTagValue("branch"));
    }

    async deleteBranch(dir: string, branch: string) {
        const command = `set git dir(${dir}) branch(${branch}) deleted/(set)`;

        const { receiver, promise } = receiveToTupleListPromise();
        this.graph.run(command, receiver)
        const rels: Tuple[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        // no output?
    }
}