import setupTableSet from "../setupTableSet";
import Tuple from "../Tuple";
import Stream from "../Stream";
import QueryEvalHelper from "../QueryEvalHelper";
import Pipe from "../Pipe";
import Query from "../Query";
import parseTuple from "../parseTuple";

function handleRedirect(input: Tuple, out: Stream) {
    const patternStr: string = input.getVal('pattern');
    const evalHelper: QueryEvalHelper = input.getVal('context.evalHelper');
    const verb = evalHelper.callVerb;

    const outputPipe = new Pipe();
    outputPipe.sendTo(out);
    evalHelper.runOneCommand({
        input: evalHelper.cxt.input,
        output: outputPipe,
        command: new Query(verb, parseTuple(patternStr), {})
    });
}

export default function setupTables() {
    return setupTableSet({
        'nested-query-test pattern': {
            name: 'NestedQueryTestQuery',
            'get pattern context.evalHelper': handleRedirect,
            'set pattern context.evalHelper': handleRedirect
        }
    })
}