import QueryContext from "./QueryContext";
import Tuple from "./Tuple";
import Stream from "./Stream";
import CommandParams from "./CommandParams";
import { runSingleTerm } from "./query/runQuery";

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

    runSingleTerm(params: CommandParams) {
        return runSingleTerm(params);
    }
}
