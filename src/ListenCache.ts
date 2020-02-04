
import Graph from './Graph'
import Relation from './Relation'
import GraphListener from './GraphListener'
import Command from './Command'
import parseCommand from './parseCommand'

type RecomputeFunc<T> = (rels: Relation[]) => T

export default class ListenCache<T> implements GraphListener {

    graph: Graph
    recompute: RecomputeFunc<T>
    stale: boolean = true
    result: any
    getCommand: Command

    constructor(graph: Graph, tags: string, recompute: RecomputeFunc<T>) {
        this.graph = graph;
        this.recompute = recompute;

        this.getCommand = parseCommand('get ' + tags);
    }

    _update() {
        // const rels = this.graph
    }

    get() {

        if (this.stale) {
            this.result = this._update();
            this.stale = false;
        }

        return this.result;
    }

    onRelationUpdated(rel: Relation) {
    }

    onRelationDeleted(rel: Relation) {
    }
}
