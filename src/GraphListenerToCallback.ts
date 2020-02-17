
/*
import Graph, { RespondFunc } from './Graph'
import Command from './Command'
import Relation from './Relation'
import RelationPattern from './RelationPattern'
import GraphListener from './GraphListener'

export default class GraphListenerToCallback implements GraphListener {

    commandExec: CommandExecution
    pattern: RelationPattern
    callback: RespondFunc

    constructor(commandExec: CommandExecution) {
        this.pattern = command.toPattern();
        this.callback = callback;
    }

    emit(str: string) {
        try {
            this.callback(str);
        } catch (e) {
            console.error(e);
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
*/
