
import Get from './Get'
import Graph, { RespondFunc } from './Graph'
import Command from './Command'
import Relation from './Relation'

export default class GraphListener {
    get: Get
    callbacks: RespondFunc[] = []

    constructor(graph: Graph, command: Command) {
        this.get = new Get(graph, command);
    }

    addCallback(callback: RespondFunc) {
        this.callbacks.push(callback);
    }

    emit(str: string) {
        for (const callback of this.callbacks) {
            try {
                callback(str);
            } catch (e) {
                console.error(e);
            }
        }
    }

    onRelationUpdated(rel: Relation) {
        if (this.get.relationMatches(rel)) {
            this.emit('set ' + this.get.formatRelation(rel));
        }
    }

    onRelationDeleted(rel: Relation) {
        if (this.get.relationMatches(rel)) {
            this.emit('delete ' + this.get.formatRelation(rel));
        }
    }
}
