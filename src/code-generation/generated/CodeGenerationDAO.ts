import { GraphLike, Relation, receiveToRelationListPromise } from "../.."

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        if (typeof graph.run !== 'function') {
            throw new Error('(code-generation/2 constructor) expected Graph or GraphLike: ' + graph);
        }

        this.graph = graph;
    }

    listCodeGenerationTargets(): string[] {
        const command = `get code-generation/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTag("code-generation"));
    }

    codeGenerationTargetStrategy(target: string): string {
        const command = `get ${target} strategy/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

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