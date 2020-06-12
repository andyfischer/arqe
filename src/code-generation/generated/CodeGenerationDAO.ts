import { GraphLike, Tuple, receiveToTupleListPromise } from "../.."

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        if (typeof graph.run !== 'function') {
            throw new Error('(code-generation/2 constructor) expected Graph or GraphLike: ' + graph);
        }

        this.graph = graph;
    }

    listCodeGenerationTargets(): string[] {
        const command = `get code-generation/* destination-filename`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        return rels.map(rel => rel.getTag("code-generation"));
    }

    codeGenerationTargetStrategy(target: string): string {
        const command = `get ${target} strategy/*`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        // Expect one result

        if (rels.length === 0) {
            throw new Error("(codeGenerationTargetStrategy) No relation found for: " + command)
        }

        if (rels.length > 1) {
            throw new Error("(codeGenerationTargetStrategy) Multiple results found for: " + command)
        }

        const oneRel = rels[0];
        return oneRel.getTagValue("strategy");
    }
}