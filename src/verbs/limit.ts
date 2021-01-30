
import CommandExecutionParams from '../CommandParams'
import { objectToTuple } from '../Tuple'
import Pipe, { joinPipes } from '../Pipe'
import QueryContext from '../QueryContext';
import { emitCommandError } from '../CommandUtils'


export default function limitCommand(params: CommandExecutionParams) {
    const { tuple, input, output, scope } = params;

    if (tuple.tags.length !== 1) {
        emitCommandError(output, "Expected one argument to 'limit' command");
        output.done();
        return;
    }

    const maxCount = parseInt(tuple.tags[0].attr);

    if (!Number.isFinite(maxCount)) {
        emitCommandError(output, "Expected number for 'limit' command: " + tuple.tags[0].attr);
        output.done();
        return;
    }

    let tuplesSeen = 0;
    let reachedLimit = false;

    input.sendTo({
        next(t) {
            if (!t.isCommandMeta()) {
                if (reachedLimit)
                    return;

                tuplesSeen++;
                output.next(t);

                if (tuplesSeen >= maxCount) {
                    reachedLimit = true;
                    output.done();
                }
            }
        },
        done() {
            if (reachedLimit)
                return;

            output.done();
        }
    }, 'limit');

}
