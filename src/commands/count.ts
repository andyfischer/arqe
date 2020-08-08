
import CommandExecutionParams from '../CommandExecutionParams'
import { objectToTuple } from '../Tuple'
import getCommand from './get'
import Pipe from '../Pipe'

export default function countCommand(params: CommandExecutionParams) {
    const { graph, command, output } = params;
    let count = 0;

    const combined = new Pipe();
    getCommand(graph, command.pattern, combined);

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
