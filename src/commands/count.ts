
import CommandExecutionParams from '../CommandParams'
import { objectToTuple } from '../Tuple'
import getCommand from './get'
import Pipe from '../Pipe'
import QueryContext from '../QueryContext';

export default function countCommand(cxt: QueryContext, params: CommandExecutionParams) {
    const { command, output } = params;
    let count = 0;

    const combined = new Pipe();
    getCommand(cxt, command.pattern, combined);

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
