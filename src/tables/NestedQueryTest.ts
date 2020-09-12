import setupTableSet from "../setupTableSet";
import Tuple from "../Tuple";
import Stream from "../Stream";
import QueryEvalHelper from "../QueryEvalHelper";
import Pipe from "../Pipe";
import ParsedQuery from "../ParsedQuery";
import parseTuple from "../parseTuple";

function handleRedirect(input: Tuple, out: Stream) {
    const patternStr: string = input.getVal('pattern');
    const evalHelper: QueryEvalHelper = input.getVal('context.evalHelper');
    const verb = evalHelper.callVerb;

    const outputPipe = new Pipe();
    outputPipe.sendTo(out);
    const pattern = parseTuple(patternStr);
    const nestedInput = new Pipe();
    nestedInput.done();

    evalHelper.runOneCommand({
        verb,
        tuple: pattern,
        input: nestedInput,
        output: outputPipe,
        flags: {}
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
