
import CommandExecutionParams from '../CommandParams'
import { objectToTuple } from '../Tuple'
import { runGet } from './get'
import Pipe from '../utils/Pipe'
import QueryContext from '../QueryContext';

export default function countCommand(cxt: QueryContext, params: CommandExecutionParams) {
    const { tuple, output } = params;
    let count = 0;

    const combined = new Pipe();
    runGet(cxt, tuple, combined);

    params.input.sendTo(combined);
    
    combined.sendTo({
        next(rel) {
            if (rel.hasAttr('command-meta'))
                return;
            count += 1;
        },
        done() {
            output.next(objectToTuple({count: count+''}));
            output.done();
        }
    });
}
