import { GraphLike, Relation, receiveToRelationListPromise } from "../.."

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        if (typeof graph.run !== 'function') {
            throw new Error('(code-generation/selftest-consumer constructor) expected Graph or GraphLike: ' + graph);
        }

        this.graph = graph;
    }

    listQueryTestExamples(): string[] {
        const command = `get query-test-example query/*`;

        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));

        return rels.map(rel => rel.getTagValue("query"));
    }
}