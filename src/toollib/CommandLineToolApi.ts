import { GraphLike, Relation, receiveToRelationListPromise } from ".."

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        this.graph = graph;
    }

    getCliInput(name: string): string {
        const command = `get cli-input(${name}) value/*`;

        const rels: Relation[] = this.graph.runSync(command)
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