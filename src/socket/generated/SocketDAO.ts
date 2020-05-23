import { GraphLike, Relation, receiveToRelationListPromise } from "../.."

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        if (typeof graph.run !== 'function') {
            throw new Error('(code-generation/socket constructor) expected Graph or GraphLike: ' + graph);
        }

        this.graph = graph;
    }

    createUniqueConnection(): string {
        const command = `set connection/(unique)`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(createUniqueConnection) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(createUniqueConnection) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTag("connection");
    }

    getServerPort(): string {
        const command = `get defaultServerPort/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(getServerPort) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(getServerPort) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("defaultServerPort");
    }

    deleteConnection(connection: string) {
        const command = `delete ${connection}`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // no output?
    }
}