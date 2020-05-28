import { GraphLike, Relation, receiveToRelationListPromise } from "../.."

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        if (typeof graph.run !== 'function') {
            throw new Error('(code-generation/selftest-provider constructor) expected Graph or GraphLike: ' + graph);
        }

        this.graph = graph;
    }
}