import { GraphLike, Relation, receiveToRelationListPromise } from ".."

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        this.graph = graph;
    }

    async getCliInput(exec: string, name: string): Promise<string> {
        const command = `get $exec cli-input(${name}) value/*`;

        const { receiver, promise } = receiveToRelationListPromise();
        this.graph.run(command, receiver)
        const rels: Relation[] = (await promise)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(getCliInput) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(getCliInput) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("value");
    }
}