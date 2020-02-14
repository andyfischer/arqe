
import { GetOperationOutput }  from './GetOperation'
import Relation from './Relation'
import Graph, { RespondFunc } from './Graph'

export default class GetResponseFormatterExists implements GetOperationOutput {
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

    finish() {
        if (!this.hasReplied)
            this.respond('#null')
    }
}
