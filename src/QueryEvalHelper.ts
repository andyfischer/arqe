import QueryContext from "./QueryContext";
import Tuple from "./Tuple";
import Stream from "./Stream";
import CommandParams from "./CommandParams";
import runOneCommand from "./runOneCommand";

export default class QueryEvalHelper {
    cxt: QueryContext

    callVerb: string
    callTuple: Tuple

    constructor(cxt: QueryContext, verb: string, tuple: Tuple) {
        this.cxt = cxt;
        this.callVerb = verb;
        this.callTuple = tuple;
    }

    runQuery(queryStr: string, out: Stream) {
        return this.cxt.graph.run(queryStr, out);
    }

    runOneCommand(params: CommandParams) {
        return runOneCommand(this.cxt, params);
    }
}