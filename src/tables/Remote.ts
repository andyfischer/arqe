
import { unwrapTuple } from '../tuple/UnwrapTupleCallback'
import QueryEvalHelper from '../QueryEvalHelper';
import Pipe from '../Pipe';
import Command from '../Command';
import parseTuple from '../parser/parseTuple';
import Tuple from '../Tuple';
import Stream from '../Stream';
import IDSource from '../utils/IDSource';
// import { Connection } from './SocketConnection'

/*
function handleRedirect(input: Tuple, out: Stream) {
    const patternStr: string = input.getVal('pattern');
    const evalHelper: QueryEvalHelper = input.getVal('evalHelper');
    const verb = evalHelper.callVerb;

    const outputPipe = new Pipe();
    outputPipe.sendTo(out);
    evalHelper.runOneCommand({
        input: evalHelper.cxt.input,
        output: outputPipe,
        command: new Query(verb, parseTuple(patternStr), {})
    });
}
*/

export default {}
/*
export default function getDef() {

    const connections = {
    }

    const nextConnId = new IDSource();

    return {
        'remotetable url': {
            name: 'NewRemoteTable',
            'insert remotetable((unique)) url': unwrapTuple(({url}) => {
                const connId = nextConnId.take();
                const conn = new Connection(connId, url);
                connections[connId] = conn;
                return { remotetable: connId }
            })
        },
        'remotetable query': {
            name: 'RemoteQuery',
            'get evalHelper': unwrapTuple(({remotetable, query, evalHelper, inputPipe, outputPipe}) => {
                const conn = connections[remotetable];
                if (!conn)
                    throw new Error("connection not found: " + remotetable)

                return {}
            })
        }
    }
}
*/
