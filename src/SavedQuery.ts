import Tuple from './Tuple'
import Graph from './Graph'
import Relation, { receiveToRelation } from './Relation';

export default class SavedQuery {
    graph: Graph
    tuple: Tuple

    constructor(graph: Graph, tuple: Tuple) {
        this.graph = graph;
        this.tuple = tuple;
    }

    getRelationAsync(): Promise<Relation> {
        return new Promise((resolve, reject) => {

            const out = receiveToRelation({
                next(t) {
                    const relation: Relation = t.getVal('r');
                    if (relation.errors)
                        reject(new Error(relation.errors[0].stringify()))
                    else
                        resolve(relation);
                },
                done() {}
            }, 'r');

            this.graph.get(this.tuple, out);
        })
    }
}