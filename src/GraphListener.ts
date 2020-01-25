
import Graph, { RespondFunc } from './Graph'
import Command from './Command'
import Relation from './Relation'
import RelationPattern from './RelationPattern'

export default class GraphListener {
    pattern: RelationPattern
    callbacks: RespondFunc[] = []

    constructor(graph: Graph, command: Command) {
        this.pattern = graph.schema.relationPattern(command);
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
        if (this.pattern.matches(rel)) {
            this.emit('set ' + this.pattern.formatRelationRelative(rel));
        }
    }

    onRelationDeleted(rel: Relation) {
        if (this.pattern.matches(rel)) {
            this.emit('delete ' + this.pattern.formatRelationRelative(rel));
        }
    }
}
