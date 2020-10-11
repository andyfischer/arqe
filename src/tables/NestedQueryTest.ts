import Tuple from "../Tuple";
import Stream from "../Stream";
import QueryEvalHelper from "../QueryEvalHelper";
import Pipe from "../utils/Pipe";
import Command from "../Command";
import parseTuple from "../stringFormat/parseTuple";

function handleRedirect(input: Tuple, out: Stream) {
    const pattern: Tuple = input.getVal('pattern');
    const evalHelper: QueryEvalHelper = input.getVal('context.evalHelper');
    const verb = evalHelper.callVerb;

    const outputPipe = new Pipe();
    outputPipe.sendTo(out);
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

export default function getDef() {
    return {
        'nested-query-test pattern': {
            name: 'NestedQueryTestQuery',
            'get pattern context.evalHelper': handleRedirect,
            'set pattern context.evalHelper': handleRedirect
        }
    }
}
