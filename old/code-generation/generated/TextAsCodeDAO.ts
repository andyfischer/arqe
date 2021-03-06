import { GraphLike, Tuple, receiveToTupleListPromise } from "../.."

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        if (typeof graph.run !== 'function') {
            throw new Error('(code-generation/3 constructor) expected Graph or GraphLike: ' + graph);
        }

        this.graph = graph;
    }

    fromFile(target: string): string {
        const command = `get ${target} from-file`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(fromFile) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(fromFile) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getVal("from-file");
    }

    destinationFilename(target: string): string {
        const command = `get ${target} destination-filename/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(destinationFilename) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(destinationFilename) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getVal("destination-filename");
    }
}