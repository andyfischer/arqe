
import Graph from './Graph'
import Schema from './Schema'
import Relation from './Relation'

export default class Database {

    graph: Graph
    schema: Schema

    objectvalues: { [objectkey: string]: {} }

    constructor(graph: Graph) {
        this.graph = graph;
        this.schema = new Schema();
    }

    save(relation: Relation) {
    }
}
