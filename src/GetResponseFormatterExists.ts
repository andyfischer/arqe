
import RelationReceiver  from './RelationReceiver'
import Relation from './Relation'
import Graph, { RespondFunc } from './Graph'

export default class GetResponseFormatterExists implements RelationReceiver {
    hasReplied = false;
    respond: RespondFunc

    constructor(respond: RespondFunc) {
        this.respond = respond;
    }

    start() {}

    relation(rel: Relation) {
        if (this.hasReplied)
            return;

        this.respond('#exists');
        this.hasReplied = true;
    }

    error(e) {
        this.respond('#error ' + e);
    }

    finish() {
        if (!this.hasReplied)
            this.respond('#null')
    }
}
