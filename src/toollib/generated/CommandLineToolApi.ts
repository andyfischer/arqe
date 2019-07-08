import { GraphLike, Tuple, receiveToTupleListPromise } from "../.."

export default class API {
    graph: GraphLike
    execId: string

    constructor(graph: GraphLike) {
        if (typeof graph.run !== 'function') {
            throw new Error('(code-generation/cliApi constructor) expected Graph or GraphLike: ' + graph);
        }

        this.graph = graph;
    }

    async getCliInput(name: string): Promise<string> {
        const execId = this.execId;
        const command = `get ${execId} cli-input(${name}) value/*`;

        const { receiver, promise } = receiveToTupleListPromise();
        this.graph.run(command, receiver)
        const rels: Tuple[] = (await promise)
            .filter(rel => !rel.hasAttr("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(getCliInput) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(getCliInput) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getVal("value");
    }
}