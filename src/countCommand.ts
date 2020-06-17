
import CommandExecutionParams from './CommandExecutionParams'
import { patternFromObject } from './Tuple'
import { combinePipes } from './pipeUtils'
import { runGet } from './runOneCommand'
import RelationPipe from './RelationPipe'

export default function countCommand(params: CommandExecutionParams) {
    const { output } = params;
    let count = 0;

    const combined = new RelationPipe();
    runGet(params.graph, params.command.pattern, combined);

    params.input.pipeToReceiver(combined);
    
    combined.pipeToReceiver({
        next(rel) {
            if (rel.hasAttr('command-meta'))
                return;
            count += 1;
        },
        done() {
            output.next(patternFromObject({count: count+''}));
            output.done();
        }
    });
}
