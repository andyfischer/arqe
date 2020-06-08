
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
        relation(rel) {
            if (rel.hasType('command-meta'))
                return;
            count += 1;
        },
        finish() {
            output.relation(patternFromObject({count: count+''}));
            output.finish();
        }
    });
}
