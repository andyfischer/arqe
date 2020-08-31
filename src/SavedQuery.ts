import Tuple from './Tuple'
import Graph from './Graph'
import Relation, { receiveToRelationInStream } from './Relation';

export default class SavedQuery {
    graph: Graph
    tuple: Tuple

    constructor(graph: Graph, tuple: Tuple) {
        this.graph = graph;
        this.tuple = tuple;
    }

    getRelationAsync(): Promise<Relation> {
        return this.graph.getRelationAsync(this.tuple);
    }
}