
import { GetOperationOutput }  from './GetOperation'
import Relation from './Relation'
import Graph, { RespondFunc } from './Graph'

export default class GetResponseFormatterExists implements GetOperationOutput {
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

    finish() {
        this.respond('' + this.count);
    }
}
