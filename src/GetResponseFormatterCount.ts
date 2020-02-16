
import RelationReceiver  from './RelationReceiver'
import Relation from './Relation'
import Graph, { RespondFunc } from './Graph'

export default class GetResponseFormatterExists implements RelationReceiver {
    count = 0
    respond: RespondFunc

    constructor(respond: RespondFunc) {
        this.respond = respond;
    }

    start() {
    }

    relation(rel: Relation) {
        this.count += 1;
    }

    error(e) {
        this.respond('#error ' + e);
    }

    finish() {
        this.respond('' + this.count);
    }
}
