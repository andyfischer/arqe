import { GraphLike, Relation, receiveToRelationListPromise } from ".."

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        this.graph = graph;
    }

    fromFile(target: string): string {
        const command = `get ${target} from-file`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(fromFile) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(fromFile) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("from-file");
    }

    destinationFilename(target: string): string {
        const command = `get ${target} destination-filename/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(destinationFilename) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(destinationFilename) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("destination-filename");
    }
}